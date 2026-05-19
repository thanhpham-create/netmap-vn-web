// Client-side speed test — time-bounded approach (luôn chạy đúng X giây).
//
// Vs v1 (download all bytes thì mới tính): time-bounded chống được nhiều issue:
// - Mạng yếu (1Mbps) không bị timeout vì test luôn dừng đúng giờ
// - Mạng mạnh đạt được peak vì có đủ bytes để saturate
// - Không cần probe phase phức tạp
// - Partial failure OK — Promise.allSettled tolerate

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Tunables
const DOWNLOAD_DURATION_MS = 8000;   // total test time
const UPLOAD_DURATION_MS   = 6000;
const DOWNLOAD_STREAMS = 4;
const STREAM_SIZE_MB = 25;           // large enough để 4 streams × 25MB không xong trong 8s với 100Mbps
const PING_SAMPLES = 5;

function throwIfRateLimited(res: Response, context: string): void {
  if (res.status === 429) {
    throw new Error(`Đã vượt giới hạn truy cập (${context}). Thử lại sau 1 phút.`);
  }
  if (!res.ok) {
    throw new Error(`Server lỗi ${res.status} (${context})`);
  }
}

/** Trung vị của N ping. AbortController per-sample chống treo. */
export async function measureLatency(samples = PING_SAMPLES): Promise<number> {
  const times: number[] = [];
  for (let i = 0; i < samples; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const t0 = performance.now();
    try {
      const res = await fetch(`${API_URL}/api/v1/measure/ping`, {
        cache: 'no-store',
        signal: ctrl.signal,
      });
      if (res.ok) times.push(performance.now() - t0);
      else if (res.status === 429) throw new Error('Đã vượt giới hạn ping.');
    } catch {
      // ignore individual ping failures
    } finally {
      clearTimeout(timer);
    }
    await new Promise((r) => setTimeout(r, 30));
  }
  if (times.length === 0) throw new Error('Tất cả ping đều fail. Kiểm tra kết nối mạng.');
  times.sort((a, b) => a - b);
  return Math.round(times[Math.floor(times.length / 2)]);
}

/**
 * Time-bounded download — runs cho đến đúng `durationMs`, count bytes nhận được.
 * Multiple parallel streams để saturate bandwidth.
 * Abort signal expected khi hết thời gian, KHÔNG phải lỗi.
 */
export async function measureDownload(onProgress?: (mbps: number) => void): Promise<number> {
  const ctrl = new AbortController();
  let totalBytes = 0;
  const t0 = performance.now();

  // Tick progress mỗi 500ms để UI update tốc độ live
  const progressInterval = setInterval(() => {
    const elapsed = performance.now() - t0;
    if (elapsed > 0 && onProgress) {
      onProgress((totalBytes * 8) / (elapsed * 1000));
    }
  }, 500);

  const timer = setTimeout(() => ctrl.abort(), DOWNLOAD_DURATION_MS);

  async function oneStream() {
    try {
      const res = await fetch(`${API_URL}/api/v1/measure/download/${STREAM_SIZE_MB}`, {
        cache: 'no-store',
        signal: ctrl.signal,
      });
      throwIfRateLimited(res, 'download');
      if (!res.body) return;
      const reader = res.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) totalBytes += value.length;
      }
    } catch (err: any) {
      // Abort sau khi hết thời gian là expected, không phải error.
      // Chrome throws DOMException 'AbortError' OR generic with msg "BodyStreamBuffer was aborted"
      const msg = err?.message || '';
      const name = err?.name || '';
      if (name === 'AbortError' || msg.includes('aborted') || msg.includes('abort')) {
        return;   // expected — silently swallow
      }
      // Other errors (network, 429, etc.) — re-throw to surface
      throw err;
    }
  }

  try {
    await Promise.allSettled(
      Array.from({ length: DOWNLOAD_STREAMS }, () => oneStream()),
    );
  } finally {
    clearTimeout(timer);
    clearInterval(progressInterval);
  }

  const elapsedMs = performance.now() - t0;
  if (totalBytes === 0) {
    throw new Error('Không nhận được dữ liệu nào. Kiểm tra kết nối mạng.');
  }
  const mbps = (totalBytes * 8) / (elapsedMs * 1000);
  if (onProgress) onProgress(mbps);
  return mbps;
}

/**
 * Time-bounded upload via XMLHttpRequest — XHR cho phép track upload progress
 * real-time qua xhr.upload.onprogress. Khác fetch (không có upload progress event).
 *
 * Tại sao XHR thay fetch: trên upload chậm, fetch phải đợi cả body upload xong mới
 * resolve, nếu timeout giữa chừng → 0 bytes counted. XHR progress event cho biết
 * chính xác bao nhiêu byte đã upload tại moment timeout.
 *
 * Strategy: gửi 1 payload lớn (UPLOAD_MAX_MB), abort sau UPLOAD_DURATION_MS,
 * count `loaded` bytes từ event cuối cùng → tính Mbps.
 */
const UPLOAD_MAX_MB = 15;

export async function measureUpload(onProgress?: (mbps: number) => void): Promise<number> {
  const totalBytes = UPLOAD_MAX_MB * 1024 * 1024;
  const buf = new Uint8Array(new ArrayBuffer(totalBytes));
  if (window.crypto?.getRandomValues) {
    const CHUNK = 65536;
    for (let off = 0; off < totalBytes; off += CHUNK) {
      window.crypto.getRandomValues(buf.subarray(off, Math.min(off + CHUNK, totalBytes)));
    }
  }

  return new Promise<number>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const t0 = performance.now();
    let lastBytes = 0;

    const timer = setTimeout(() => {
      try { xhr.abort(); } catch {}
    }, UPLOAD_DURATION_MS);

    function finalize(reason: 'progress-end' | 'aborted' | 'error' | 'complete') {
      clearTimeout(timer);
      const elapsedMs = performance.now() - t0;
      if (lastBytes === 0) {
        reject(new Error(`Không upload được dữ liệu nào (${reason}). Mạng upload có thể quá chậm hoặc bị chặn.`));
        return;
      }
      const mbps = (lastBytes * 8) / (elapsedMs * 1000);
      resolve(mbps);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        lastBytes = e.loaded;
        const elapsed = performance.now() - t0;
        if (elapsed > 0 && onProgress) {
          onProgress((e.loaded * 8) / (elapsed * 1000));
        }
      }
    };
    xhr.upload.onload = () => finalize('complete');
    xhr.upload.onabort = () => finalize('aborted');
    xhr.upload.onerror = () => finalize('error');
    // Some browsers fire only onreadystatechange when aborted
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE && lastBytes > 0) {
        finalize('progress-end');
      }
    };

    try {
      xhr.open('POST', `${API_URL}/api/v1/measure/upload`);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.send(buf);
    } catch (err: any) {
      clearTimeout(timer);
      reject(new Error(`Upload failed to start: ${err?.message || err}`));
    }
  });
}

export type SpeedTestResult = {
  downloadMbps: number;
  uploadMbps: number;
  latencyMs: number;
};

export type SpeedTestPhase = 'ping' | 'download' | 'upload';

export async function runSpeedTest(
  onUpdate?: (phase: SpeedTestPhase, mbps?: number) => void,
): Promise<SpeedTestResult> {
  onUpdate?.('ping');
  const latencyMs = await measureLatency();

  onUpdate?.('download');
  const downloadMbps = await measureDownload((mbps) => onUpdate?.('download', mbps));

  onUpdate?.('upload');
  const uploadMbps = await measureUpload((mbps) => onUpdate?.('upload', mbps));

  return {
    downloadMbps: Math.round(downloadMbps * 100) / 100,
    uploadMbps: Math.round(uploadMbps * 100) / 100,
    latencyMs,
  };
}
