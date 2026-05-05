// Lightweight API documentation page.
// For full Swagger UI, you'd embed swagger-ui-react. We keep it minimal — readable plain HTML.

import Link from 'next/link';

const ENDPOINTS = [
  {
    section: 'Open Data API (public, CC-BY-4.0)',
    description: 'Read-only access to crowdsourced telecom data. No authentication needed (rate-limited per IP).',
    endpoints: [
      { method: 'GET', path: '/api/v1/data',                     description: 'API index + rate limit info' },
      { method: 'GET', path: '/api/v1/data/speed-tests',         description: 'Filter speed tests by date/province/carrier/network. JSON or CSV.' },
      { method: 'GET', path: '/api/v1/data/outages',             description: 'Outage reports with similar filters + verifiedOnly flag.' },
      { method: 'GET', path: '/api/v1/data/carriers-stats',      description: 'Daily aggregates per carrier (test count, avg speeds, 5G %).' },
    ],
  },
  {
    section: 'Coverage & Outages',
    description: 'Aggregated views for map / dashboard.',
    endpoints: [
      { method: 'GET', path: '/api/v1/coverage',                 description: 'Coverage stats around a point (radius, optional carrier filter).' },
      { method: 'GET', path: '/api/v1/coverage/heatmap',         description: 'Heatmap points within a bounding box.' },
      { method: 'GET', path: '/api/v1/coverage/buildings',       description: 'Building-level coverage.' },
      { method: 'GET', path: '/api/v1/outages/active',           description: 'Active clusters near a point.' },
      { method: 'GET', path: '/api/v1/outages/national',         description: 'Country-wide outage summary.' },
      { method: 'GET', path: '/api/v1/carriers/compare',         description: 'Compare carriers by province/network.' },
      { method: 'GET', path: '/api/v1/carriers/provinces',       description: 'List provinces with data.' },
    ],
  },
  {
    section: 'Authentication',
    description: 'OTP via SMS, JWT for sessions.',
    endpoints: [
      { method: 'POST',  path: '/api/v1/auth/otp/request',       description: 'Send OTP to phone (cooldown 60s).' },
      { method: 'POST',  path: '/api/v1/auth/otp/verify',        description: 'Verify OTP, get user JWT (30d).' },
      { method: 'GET',   path: '/api/v1/auth/me',                description: 'Current user (requires user JWT).' },
      { method: 'PATCH', path: '/api/v1/auth/me',                description: 'Update displayName.' },
      { method: 'GET',   path: '/api/v1/auth/me/activity',       description: 'Recent speed tests + outages of current user.' },
    ],
  },
  {
    section: 'Devices',
    description: 'Device registration with optional user-link.',
    endpoints: [
      { method: 'POST', path: '/api/v1/devices/register',        description: 'Register device, get device JWT (90d).' },
      { method: 'GET',  path: '/api/v1/devices/:uid',            description: 'Device info by uid.' },
    ],
  },
  {
    section: 'Submissions (auth required)',
    description: 'Mutations need either user or device JWT. Device ID taken from token.',
    endpoints: [
      { method: 'POST', path: '/api/v1/speed-tests',             description: 'Submit speed test (with optional signal sample).' },
      { method: 'POST', path: '/api/v1/outages/report',          description: 'Report outage. Auto-verifies on cluster ≥ 5.' },
      { method: 'POST', path: '/api/v1/outages/:id/resolve',     description: 'Mark cluster resolved (operator/admin only).' },
    ],
  },
  {
    section: 'Leaderboard & Badges',
    description: 'Gamification — rank by contribution, earn badges.',
    endpoints: [
      { method: 'GET', path: '/api/v1/leaderboard/contributors', description: 'Combined score (1pt/test, 3pt/outage, +2pt/verified).' },
      { method: 'GET', path: '/api/v1/leaderboard/speed-tests',  description: 'Top by test count.' },
      { method: 'GET', path: '/api/v1/leaderboard/outages',      description: 'Top by outage reports.' },
      { method: 'GET', path: '/api/v1/leaderboard/me',           description: 'Current user rank.' },
      { method: 'GET', path: '/api/v1/badges',                   description: 'All 14 badge definitions.' },
      { method: 'GET', path: '/api/v1/badges/me',                description: 'Earned + progress for current user.' },
      { method: 'GET', path: '/api/v1/badges/:userId',           description: 'Public profile badges (only earned).' },
    ],
  },
  {
    section: 'Push notifications (user JWT)',
    description: 'Web Push (VAPID). Subscribe to receive outage alerts near you.',
    endpoints: [
      { method: 'GET',    path: '/api/v1/push/vapid-public-key', description: 'VAPID public key for client-side subscribe.' },
      { method: 'POST',   path: '/api/v1/push/subscribe',         description: 'Save subscription (with optional location filter).' },
      { method: 'DELETE', path: '/api/v1/push/subscribe',         description: 'Unsubscribe by endpoint.' },
      { method: 'GET',    path: '/api/v1/push/me',                description: "List current user's subscriptions." },
    ],
  },
  {
    section: 'Admin (operator/admin user JWT)',
    description: 'Dashboard + bulk operations.',
    endpoints: [
      { method: 'GET', path: '/api/v1/admin/stats',          description: 'Totals, carrier breakdown, outage stats.' },
      { method: 'GET', path: '/api/v1/admin/recent-outages', description: 'Active outage clusters list.' },
      { method: 'GET', path: '/api/v1/admin/users',          description: 'User list (admin only).' },
    ],
  },
  {
    section: 'Measurement (for client speedtest)',
    description: 'Anonymous endpoints used by /speedtest page.',
    endpoints: [
      { method: 'GET',  path: '/api/v1/measure/ping',                description: 'Latency probe.' },
      { method: 'GET',  path: '/api/v1/measure/download/:sizeMb',    description: 'Returns N MB random bytes.' },
      { method: 'POST', path: '/api/v1/measure/upload',              description: 'Echo blob, return size + elapsed.' },
    ],
  },
];

const METHOD_COLOR: Record<string, string> = {
  GET:    'bg-blue-100 text-blue-700',
  POST:   'bg-green-100 text-green-700',
  PATCH:  'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
};

export default function ApiDocsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">NetMap VN — API Documentation</h1>
        <p className="mt-1 text-sm text-gray-600">
          Base URL: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{apiUrl}</code>
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Open Data API endpoints (<code>/api/v1/data/*</code>) are <span className="font-medium">public</span>{' '}
          and rate-limited per IP. Other endpoints require JWT — see{' '}
          <Link href="/login" className="text-vnred-600 hover:underline">login</Link> flow.
        </p>
      </header>

      <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-semibold">Rate limits</p>
        <ul className="mt-1 list-disc pl-5">
          <li>Anonymous (per IP): <span className="font-mono">60 req/min</span></li>
          <li>Device token: <span className="font-mono">200 req/min</span></li>
          <li>User (consumer): <span className="font-mono">300 req/min</span></li>
          <li>User (admin/operator): <span className="font-mono">1000 req/min</span></li>
        </ul>
        <p className="mt-2 text-xs">Response includes <code>X-RateLimit-Limit/Remaining/Reset</code> headers.</p>
      </div>

      {ENDPOINTS.map((section) => (
        <section key={section.section}>
          <h2 className="text-lg font-bold">{section.section}</h2>
          <p className="mb-2 text-sm text-gray-600">{section.description}</p>
          <div className="overflow-hidden rounded-md border bg-white shadow-sm">
            <table className="w-full text-sm">
              <tbody>
                {section.endpoints.map((e) => (
                  <tr key={e.method + e.path} className="border-b last:border-b-0">
                    <td className="w-20 px-3 py-2 align-top">
                      <span className={`rounded px-2 py-0.5 font-mono text-xs font-semibold ${METHOD_COLOR[e.method] || 'bg-gray-100 text-gray-700'}`}>
                        {e.method}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <code className="font-mono text-xs">{e.path}</code>
                      <p className="mt-0.5 text-xs text-gray-500">{e.description}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <footer className="rounded-md border bg-gray-50 p-4 text-xs text-gray-600">
        <p>
          Open Data API license: <strong>CC-BY-4.0</strong>. When using data, please attribute "NetMap VN cộng đồng".
        </p>
        <p className="mt-1">
          Contact: <a href="mailto:hello@netmap.vn" className="text-vnred-600 hover:underline">hello@netmap.vn</a>
        </p>
      </footer>
    </div>
  );
}
