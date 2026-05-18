// Client-side speed test — measure download/upload/ping qua backend /measure endpoints.
//
// Improvements vs v1:
// 1. MULTI-STREAM parallel download — 4 parallel TCP streams thay 1 stream để
//    vượt qua giới hạn bandwidth-delay product khi server ở xa (Singapore vs VN ~30ms RTT).
// 2. ADAPTIVE SIZING — probe 2MB nhanh trước, sau đó decide test size lớn hơn nếu mạng nhanh.
// 3. WARMUP SKIP — bỏ 0.5s đầu khỏi tính Mbps để loại trừ TCP slow start.
// 4. HARD TIMEOUT — mỗi phase max 15s; nếu chậm hơn → abort + return ước lượng.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Tunables — anh có thể chỉnh để cân bằng accuracy vs speed
const PARALLEL_STREAMS = 4;
const WARMUP_MS = 500;
const PHASE_TIMEOUT_MS = 15_000;
const PROBE_SIZE_MB = 2;
// Test sizes per stream sau khi đã probe. Total bytes = streams * size.
const SMALL_SIZE_MB = 2;     // <50 Mbps connection — 4 × 2MB = 8MB total
const MED_SIZE_MB = 5;       // 50-200 Mbps — 4 × 5MB = 20MB total
const LARGE_SIZE_MB = 10;    // >200 Mbps — 4 × 10MB = 40MB total

function throwIfRateLimited(res: Response, context: string): void {
  if (res.status === 429) {
    throw new Error(`Đã vượt giới hạn truy cập. Vui lòng thử lại sau 1 phút. (${context})`);
  }
  if (!res.ok) {
    throw new Error(`Server lỗi ${res.status} (${context})`);
  }
}

/** Round-trip latency = median của N ping. Dùng AbortController để chống treo. */
export async function measureLatency(samples = 5): Promise<number> {
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
      throwIfRateLimited(res, 'ping');
      times.push(performance.now() - t0);
    } catch (err) {
      // Ping fail — skip, dùng các sample còn lại
      if (i === 0 && samples === 1) throw err;
    } finally {
      clearTimeout(timer);
    }
    await new Promise((r) => setTimeout(r, 30));
  }
  if (times.length === 0) throw new Error('Tất cả ping đều fail.');
  times.sort((a, b) => a - b);
  return Math.round(times[Math.floor(times.length / 2)]);
}

/** Một stream download. Trả về { bytes, bytesAfterWarmup, elapsedMs, warmupMs }. */
async function downloadStream(
  sizeMb: number,
  signal: AbortSignal,
  onProgress?: (totalBytes: number, elapsedMs: number) => void,
): Promise<{ bytes: number; bytesAfterWarmup: number; elapsedMs: number; warmupMs: number }> {
  const t0 = performance.now();
  let warmupBytes = 0;
  let warmupSetAt = -1;

  const res = await fetch(`${API_URL}/api/v1/measure/download/${sizeMb}`, {
    cache: 'no-store',
    signal,
  });
  throwIfRateLimited(res, 'download');
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    const elapsed = performance.now() - t0;
    if (warmupSetAt < 0 && elapsed >= WARMUP_MS) {
      warmupBytes = bytes;
      warmupSetAt = elapsed;
    }
    if (onProgress) onProgress(bytes, elapsed);
  }
  const elapsedMs = performance.now() - t0;
  const bytesAfterWarmup = warmupSetAt > 0 ? bytes - warmupBytes : bytes;
  return { bytes, bytesAfterWarmup, elapsedMs, warmupMs: Math.max(warmupSetAt, WARMUP_MS) };
}

/**
 * Download phase: 1 probe stream (2MB) → quyết định size → N streams parallel.
 * Mbps = (totalBytesAfterWarmup * 8) / (avgElapsedAfterWarmup) — exclude TCP slow start.
 */
export async function measureDownload(onProgress?: (mbps: number) => void): Promise<number> {
  // ── Probe ────────────────────────────────────────────────────────
  const probeCtrl = new AbortController();
  const probeTimer = setTimeout(() => probeCtrl.abort(), 8000);
  let probeMbps: number;
  try {
    const p = await downloadStream(PROBE_SIZE_MB, probeCtrl.signal);
    probeMbps = (p.bytes * 8) / (p.elapsedMs * 1000); // Mbps
  } finally {
    clearTimeout(probeTimer);
  }

  if (onProgress) onProgress(probeMbps);

  // Decide per-stream size based on probe speed
  const perStreamMb =
    probeMbps < 50 ? SMALL_SIZE_MB :
    probeMbps < 200 ? MED_SIZE_MB :
    LARGE_SIZE_MB;

  // ── Parallel main test ───────────────────────────────────────────
  const ctrl = new AbortController();
  const phaseTimer = setTimeout(() => ctrl.abort(), PHASE_TIMEOUT_MS);
  const t0 = performance.now();
  let totalBytesSoFar = 0;

  function onStreamProgress(_streamBytes: number, _elapsed: number) {
    // Aggregate live across streams not done — keep simple
    const elapsed = performance.now() - t0;
    if (elapsed > WARMUP_MS && onProgress) {
      // Total bytes across streams updated by stream finish — approximate during stream
      const mbps = (totalBytesSoFar * 8) / (elapsed * 1000);
      if (mbps > 0) onProgress(mbps);
    }
  }

  try {
    const streams = await Promise.all(
      Array.from({ length: PARALLEL_STREAMS }, async () => {
        const r = await downloadStream(perStreamMb, ctrl.signal, onStreamProgress);
        totalBytesSoFar += r.bytes;
        return r;
      }),
    );
    const elapsedMs = performance.now() - t0;
    const totalBytesAfterWarmup = streams.reduce((s, x) => s + x.bytesAfterWarmup, 0);
    const effectiveMs = elapsedMs - WARMUP_MS;
    if (effectiveMs <= 0 || totalBytesAfterWarmup === 0) {
      // Mạng quá nhanh, test xong trước warmup → dùng tổng bytes / tổng time
      const fallback = streams.reduce((s, x) => s + x.bytes, 0);
      return (fallback * 8) / (elapsedMs * 1000);
    }
    return (totalBytesAfterWarmup * 8) / (effectiveMs * 1000);
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      // Timeout — return best estimate from probe
      return probeMbps;
    }
    throw err;
  } finally {
    clearTimeout(phaseTimer);
  }
}

/** Upload — single stream để giữ logic đơn giản. Mạng asym (down>up) hầu như không cần multi-stream up. */
export async function measureUpload(sizeMb = 3, onProgress?: (mbps: number) => void): Promise<number> {
  const bytes = sizeMb * 1024 * 1024;
  const buffer = new ArrayBuffer(bytes);
  const buf = new Uint8Array(buffer);
  if (window.crypto?.getRandomValues) {
    const CHUNK = 65536;
    for (let off = 0; off < bytes; off += CHUNK) {
      window.crypto.getRandomValues(buf.subarray(off, Math.min(off + CHUNK, bytes)));
    }
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PHASE_TIMEOUT_MS);
  const t0 = performance.now();
  try {
    const res = await fetch(`${API_URL}/api/v1/measure/upload`, {
      method: 'POST',
      body: buf,
      headers: { 'Content-Type': 'application/octet-stream' },
      signal: ctrl.signal,
    });
    throwIfRateLimited(res, 'upload');
    const elapsedMs = performance.now() - t0;
    const mbps = (bytes * 8) / (elapsedMs * 1000);
    if (onProgress) onProgress(mbps);
    return mbps;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Upload timeout sau 15s — mạng quá chậm hoặc không ổn định.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
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
  const latencyMs = await measureLatency(5);

  onUpdate?.('download');
  const downloadMbps = await measureDownload((mbps) => onUpdate?.('download', mbps));

  onUpdate?.('upload');
  const uploadMbps = await measureUpload(3, (mbps) => onUpdate?.('upload', mbps));

  return {
    downloadMbps: Math.round(downloadMbps * 100) / 100,
    uploadMbps: Math.round(uploadMbps * 100) / 100,
    latencyMs,
  };
}
