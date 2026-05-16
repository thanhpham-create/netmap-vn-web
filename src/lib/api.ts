// NetMap VN — API client
// Thin fetch wrapper. Token (device or user) is auto-attached when present.

import type { JwtTokens } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type RequestInitWithJson = Omit<RequestInit, 'body'> & { body?: any };

async function request<T = any>(
  path: string,
  opts: RequestInitWithJson = {},
  tokens?: JwtTokens,
): Promise<T> {
  const headers = new Headers(opts.headers);
  headers.set('Content-Type', 'application/json');

  // Prefer USER token (more privileged — needed for /admin, /me, /resolve).
  // Backend's authenticateAny accepts user token too for /speed-tests, /outages/report.
  // For anonymous reporting (no user logged in), device token fallback is used.
  const token = tokens?.userToken ?? tokens?.deviceToken;
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const init: RequestInit = {
    ...opts,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  };

  const res = await fetch(`${API_URL}${path}`, init);
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const err = new Error(typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`);
    (err as any).status = res.status;
    (err as any).body = data;
    throw err;
  }
  return data as T;
}

// =================== Types ===================
export type Coverage = {
  carrierName: string;
  networkType: string;
  sampleCount: number;
  avgDownloadMbps: number;
  avgUploadMbps: number;
  avgLatencyMs: number;
  coverageQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor';
};

export type HeatmapPoint = {
  latGrid: number;
  lngGrid: number;
  carrierName: string;
  networkType: string;
  sampleCount: number;
  avgDownloadMbps: number;
  avgLatencyMs: number;
};

export type ActiveOutage = {
  carrierName: string;
  outageType: string;
  reportCount: number;
  firstReported: string;
  lastReported: string;
  affectedAreas: string[] | null;
};

export type NationalOutageSummary = {
  carrierName: string;
  outageType: string;
  reportCount: number;
  provincesAffected: number;
  provinces: string[] | null;
};

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  rank: number;
  testCount?: number;
  reportCount?: number;
  verifiedCount?: number;
  score?: number;
  lastAt: string;
  topBadges?: string[];   // top 3 earned badge emojis
  badgeCount?: number;
};

// =================== Endpoints ===================
export const api = {
  // Auth
  requestOtp: (phone: string) =>
    request<{ expiresIn: number; devOtp?: string }>('/api/v1/auth/otp/request', {
      method: 'POST', body: { phone },
    }),

  verifyOtp: (phone: string, code: string) =>
    request<{ token: string; user: { id: string; phone: string; role: string; displayName?: string } }>(
      '/api/v1/auth/otp/verify',
      { method: 'POST', body: { phone, code } },
    ),

  me: (tokens: JwtTokens) =>
    request<{ user: { id: string; phone: string; role: string; displayName?: string; createdAt: string } }>(
      '/api/v1/auth/me', {}, tokens,
    ),

  updateMe: (payload: { displayName?: string | null }, tokens: JwtTokens) =>
    request<{ user: { id: string; phone: string; role: string; displayName?: string } }>(
      '/api/v1/auth/me', { method: 'PATCH', body: payload }, tokens,
    ),

  myActivity: (tokens: JwtTokens, limit = 10) =>
    request<{
      tests: Array<{
        id: number; carrierName: string; networkType: string;
        downloadMbps: number; uploadMbps: number; latencyMs: number;
        latitude: number; longitude: number; province?: string; district?: string;
        recordedAt: string;
      }>;
      outages: Array<{
        id: number; carrierName: string; outageType: string; description?: string;
        latitude: number; longitude: number; province?: string; district?: string;
        clusterSize: number; isVerified: boolean; resolvedAt: string | null; reportedAt: string;
      }>;
    }>(`/api/v1/auth/me/activity?limit=${limit}`, {}, tokens),

  // Admin
  adminStats: (tokens: JwtTokens) =>
    request<{
      totals: {
        totalUsers: number; totalDevices: number; activeDevices7d: number;
        totalTests: number; tests24h: number;
        activeOutages24h: number; verifiedOutages24h: number;
      };
      carrierBreakdown: Array<{ carrierName: string; testCount: number; avgDownload: number; avgLatency: number }>;
      outageStats: Array<{ carrierName: string; outageType: string; reportCount: number; verified: number }>;
      topProblematicProvinces: Array<{ province: string; reportCount: number }>;
      generatedAt: string;
    }>('/api/v1/admin/stats', {}, tokens),

  adminRecentOutages: (tokens: JwtTokens, opts: { limit?: number; verifiedOnly?: boolean } = {}) => {
    const p = new URLSearchParams();
    if (opts.limit) p.set('limit', String(opts.limit));
    if (opts.verifiedOnly) p.set('verified', 'true');
    return request<{
      outages: Array<{
        id: number; carrierName: string; outageType: string; description?: string;
        latitude: number; longitude: number; province?: string; district?: string; ward?: string;
        clusterSize: number; isVerified: boolean; resolvedAt: string | null; reportedAt: string;
      }>;
    }>(`/api/v1/admin/recent-outages?${p}`, {}, tokens);
  },

  resolveOutage: (id: number, tokens: JwtTokens) =>
    request<{ resolvedCount: number; message: string }>(
      `/api/v1/outages/${id}/resolve`, { method: 'POST' }, tokens,
    ),

  // Whoami — detect user's carrier from IP/ASN
  whoami: () =>
    request<{
      ip: string;
      carrier: string | null;
      asn: number | null;
      asName: string | null;
      asCountry: string | null;
      confidence: 'high' | 'low' | 'none';
    }>('/api/v1/measure/whoami'),

  // Carriers
  carrierProvinces: () =>
    request<{ provinces: Array<{ province: string; testCount: number }> }>(
      '/api/v1/carriers/provinces',
    ),

  // Push
  pushVapidKey: () =>
    request<{ publicKey: string }>('/api/v1/push/vapid-public-key'),

  pushSubscribe: (
    payload: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
      latitude?: number;
      longitude?: number;
      radiusM?: number;
      carriers?: string[];
    },
    tokens: JwtTokens,
  ) => request<{ subscriptionId: number }>(
    '/api/v1/push/subscribe', { method: 'POST', body: payload }, tokens,
  ),

  pushUnsubscribe: (endpoint: string, tokens: JwtTokens) =>
    request<{ deleted: number }>(
      '/api/v1/push/subscribe', { method: 'DELETE', body: { endpoint } }, tokens,
    ),

  pushMySubscriptions: (tokens: JwtTokens) =>
    request<{ subscriptions: Array<{ id: number; endpoint: string; latitude: number; longitude: number; radiusM: number; carriers: string[] | null; lastUsed: string }> }>(
      '/api/v1/push/me', {}, tokens,
    ),

  // Badges
  allBadges: () =>
    request<{ badges: Array<{ id: string; name: string; description: string; emoji: string; category: string; threshold: number; metricLabel: string }> }>(
      '/api/v1/badges',
    ),

  myBadges: (tokens: JwtTokens) =>
    request<{
      badges: Array<{
        id: string; name: string; description: string; emoji: string; category: string;
        threshold: number; metricLabel: string;
        earned: boolean; progress: number; earnedAt?: string;
      }>;
      earnedCount: number;
      totalCount: number;
    }>('/api/v1/badges/me', {}, tokens),

  compareCarriers: (q: { province?: string; days?: number; network?: string } = {}) => {
    const p = new URLSearchParams();
    if (q.province) p.set('province', q.province);
    if (q.days) p.set('days', String(q.days));
    if (q.network) p.set('network', q.network);
    return request<{
      province: string; days: number; network: string;
      carriers: Array<{
        carrierName: string;
        testCount: number;
        avgDownloadMbps: number; avgUploadMbps: number; avgLatencyMs: number;
        medianDownloadMbps: number;
        pct5g: number;
        deviceCount: number;
        outageCount: number; verifiedOutages: number;
        reliabilityScore: number | null;
      }>;
    }>(`/api/v1/carriers/compare?${p}`);
  },

  // Devices
  registerDevice: (
    payload: {
      deviceUid: string;
      platform: 'ios' | 'android' | 'web';
      osVersion?: string;
      appVersion?: string;
      deviceModel?: string;
      carrierName?: string;
    },
    tokens?: JwtTokens,
  ) =>
    request<{ device: { id: string; deviceUid: string; platform: string }; deviceToken: string }>(
      '/api/v1/devices/register',
      { method: 'POST', body: payload },
      tokens,
    ),

  // Coverage
  coverage: (q: { lat: number; lng: number; radius?: number; carrier?: string; days?: number }) => {
    const p = new URLSearchParams();
    p.set('lat', String(q.lat)); p.set('lng', String(q.lng));
    if (q.radius) p.set('radius', String(q.radius));
    if (q.carrier) p.set('carrier', q.carrier);
    if (q.days) p.set('days', String(q.days));
    return request<{ coverage: Coverage[] }>(`/api/v1/coverage?${p}`);
  },

  heatmap: (q: { minLat: number; maxLat: number; minLng: number; maxLng: number; carrier?: string; days?: number }) => {
    const p = new URLSearchParams();
    p.set('minLat', String(q.minLat)); p.set('maxLat', String(q.maxLat));
    p.set('minLng', String(q.minLng)); p.set('maxLng', String(q.maxLng));
    if (q.carrier) p.set('carrier', q.carrier);
    if (q.days) p.set('days', String(q.days));
    return request<{ points: HeatmapPoint[]; count: number }>(`/api/v1/coverage/heatmap?${p}`);
  },

  // Speed test
  submitSpeedTest: (
    payload: {
      carrierName: string;
      networkType: string;
      downloadMbps: number;
      uploadMbps: number;
      latencyMs: number;
      latitude: number;
      longitude: number;
      [k: string]: any;
    },
    tokens: JwtTokens,
  ) =>
    request('/api/v1/speed-tests', { method: 'POST', body: payload }, tokens),

  // Outages
  reportOutage: (
    payload: {
      carrierName: string;
      outageType: 'no_signal' | 'slow' | 'no_data' | 'no_call' | 'no_sms' | 'intermittent';
      latitude: number;
      longitude: number;
      description?: string;
      province?: string;
      district?: string;
      ward?: string;
    },
    tokens: JwtTokens,
  ) =>
    request<{ report: { id: number; clusterSize: number; isVerified: boolean }; message: string }>(
      '/api/v1/outages/report', { method: 'POST', body: payload }, tokens,
    ),

  activeOutages: (q: { lat: number; lng: number; radius?: number; hours?: number }) => {
    const p = new URLSearchParams();
    p.set('lat', String(q.lat)); p.set('lng', String(q.lng));
    if (q.radius) p.set('radius', String(q.radius));
    if (q.hours) p.set('hours', String(q.hours));
    return request<{ outages: ActiveOutage[]; hasActiveOutages: boolean }>(`/api/v1/outages/active?${p}`);
  },

  nationalOutages: () =>
    request<{ summary: NationalOutageSummary[]; generatedAt: string }>('/api/v1/outages/national'),

  // Leaderboard
  leaderboardSpeedTests: (period: 'week' | 'month' | 'all' = 'month', limit = 10) =>
    request<{ period: string; leaderboard: LeaderboardEntry[] }>(
      `/api/v1/leaderboard/speed-tests?period=${period}&limit=${limit}`,
    ),

  leaderboardOutages: (period: 'week' | 'month' | 'all' = 'month', limit = 10) =>
    request<{ period: string; leaderboard: LeaderboardEntry[] }>(
      `/api/v1/leaderboard/outages?period=${period}&limit=${limit}`,
    ),

  leaderboardContributors: (period: 'week' | 'month' | 'all' = 'month', limit = 10) =>
    request<{ period: string; leaderboard: LeaderboardEntry[] }>(
      `/api/v1/leaderboard/contributors?period=${period}&limit=${limit}`,
    ),

  leaderboardProvinces: (period: 'week' | 'month' | 'all' = 'month', limit = 20) =>
    request<{
      period: string;
      leaderboard: Array<{
        rank: number;
        province: string;
        testCount: number;
        uniqueDevices: number;
        reportCount: number;
        verifiedCount: number;
        score: number;
        lastAt: string;
      }>;
    }>(`/api/v1/leaderboard/provinces?period=${period}&limit=${limit}`),

  leaderboardMe: (tokens: JwtTokens, period: 'week' | 'month' | 'all' = 'month') =>
    request<{
      period: string;
      rank: number | null;
      totalParticipants: number;
      stats: { testCount: number; reportCount: number; verifiedCount: number; score: number };
    }>(`/api/v1/leaderboard/me?period=${period}`, {}, tokens),
};
