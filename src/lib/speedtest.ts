// Client-side speed test
// Uses backend /measure endpoints. Returns { downloadMbps, uploadMbps, latencyMs }.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function throwIfRateLimited(res: Response, context: string): void {
  if (res.status === 429) {
    throw new Error(`Đã vượt giới hạn truy cập. Vui lòng thử lại sau 1 phút. (${context})`);
  }
  if (!res.ok) {
    throw new Error(`Server lỗi ${res.status} (${context})`);
  }
}

export async function measureLatency(samples = 3): Promise<number> {
  const times: number[] = [];
  for (let i = 0; i < samples; i++) {
    const t0 = performance.now();
    try {
      const res = await fetch(`${API_URL}/api/v1/measure/ping`, { cache: 'no-store' });
      throwIfRateLimited(res, 'ping');
    } catch (err) {
      throw err instanceof Error ? err : new Error(String(err));
    }
    times.push(performance.now() - t0);
    await new Promise((r) => setTimeout(r, 50));
  }
  // Take median to filter outliers
  times.sort((a, b) => a - b);
  return Math.round(times[Math.floor(times.length / 2)]);
}

export async function measureDownload(sizeMb = 10, onProgress?: (mbps: number) => void): Promise<number> {
  const t0 = performance.now();
  const res = await fetch(`${API_URL}/api/v1/measure/download/${sizeMb}`, { cache: 'no-store' });
  throwIfRateLimited(res, 'download');
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.length;
    if (onProgress) {
      const elapsed = (performance.now() - t0) / 1000;
      const mbps = (received * 8) / (elapsed * 1_000_000);
      onProgress(mbps);
    }
  }
  const elapsedS = (performance.now() - t0) / 1000;
  // Sanity check: if we got way too few bytes (e.g. JSON error response), it's invalid
  const expectedBytes = sizeMb * 1024 * 1024;
  if (received < expectedBytes * 0.9) {
    throw new Error(`Download chỉ nhận ${received} bytes thay vì ${expectedBytes}. Kiểm tra mạng hoặc thử lại.`);
  }
  return (received * 8) / (elapsedS * 1_000_000);
}

export async function measureUpload(sizeMb = 5, onProgress?: (mbps: number) => void): Promise<number> {
  const bytes = sizeMb * 1024 * 1024;
  const buf = new Uint8Array(bytes);
  if (window.crypto?.getRandomValues) {
    const CHUNK = 65536;
    for (let off = 0; off < bytes; off += CHUNK) {
      window.crypto.getRandomValues(buf.subarray(off, Math.min(off + CHUNK, bytes)));
    }
  } else {
    for (let i = 0; i < bytes; i++) buf[i] = Math.floor(Math.random() * 256);
  }

  const t0 = performance.now();
  const res = await fetch(`${API_URL}/api/v1/measure/upload`, {
    method: 'POST',
    body: buf,
    headers: { 'Content-Type': 'application/octet-stream' },
  });
  throwIfRateLimited(res, 'upload');
  const elapsedS = (performance.now() - t0) / 1000;
  const mbps = (bytes * 8) / (elapsedS * 1_000_000);
  if (onProgress) onProgress(mbps);
  return mbps;
}

export type SpeedTestResult = {
  downloadMbps: number;
  uploadMbps: number;
  latencyMs: number;
};

/** Phase keys for i18n. Caller maps these to localized strings. */
export type SpeedTestPhase = 'ping' | 'download' | 'upload';

export async function runSpeedTest(
  onUpdate?: (phase: SpeedTestPhase, mbps?: number) => void,
): Promise<SpeedTestResult> {
  onUpdate?.('ping');
  const latencyMs = await measureLatency(3);

  onUpdate?.('download');
  const downloadMbps = await measureDownload(10, (mbps) => onUpdate?.('download', mbps));

  onUpdate?.('upload');
  const uploadMbps = await measureUpload(5, (mbps) => onUpdate?.('upload', mbps));

  return {
    downloadMbps: Math.round(downloadMbps * 100) / 100,
    uploadMbps: Math.round(uploadMbps * 100) / 100,
    latencyMs,
  };
}
