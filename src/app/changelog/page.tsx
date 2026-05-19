// Changelog page — hiển thị lịch sử thay đổi của NetMap VN.
// Hardcoded content thay vì parse CHANGELOG.md để giữ Next.js bundle gọn.

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Changelog · NetMap VN',
  description: 'Lịch sử các phiên bản, tính năng mới, cải tiến của NetMap VN.',
  alternates: { canonical: '/changelog' },
};

type Entry = {
  version: string;
  date: string;
  highlights: string[];
};

const ENTRIES: Entry[] = [
  {
    version: 'v1.1 — Phase 10 Launch readiness',
    date: '2026-05-22',
    highlights: [
      'Welcome onboarding 3 bước cho user mới',
      'Trang Roadmap + Changelog công khai',
      'Cải tiến speed test: time-bounded approach + multi-stream parallel',
      'Carrier detection strict lock khi confidence cao (chống ghi nhầm)',
      'Sửa mapping ASN AS24086 (Viettel, không phải VNPT như trước)',
    ],
  },
  {
    version: 'v1.0 — Phase 9 Content & Growth',
    date: '2026-05-20',
    highlights: [
      '30 trang landing page tỉnh/thành phố SSG (/coverage/[slug])',
      '6 trang landing page nhà mạng (/carriers/[slug])',
      'Cmd-K command palette cho quick navigation',
      'Social share buttons (Facebook/Twitter/Zalo)',
      'Blog scaffold + 2 bài viết mẫu',
    ],
  },
  {
    version: 'Phase 8 Professional polish',
    date: '2026-05-19',
    highlights: [
      'Backend gzip + brotli compression cho JSON responses',
      'Cache-control headers per endpoint',
      'Anomaly detection cho speed test (hard/soft flag)',
      'Admin moderation tools (list flagged, unflag, delete)',
      'Public /status page kiểm tra backend health',
      'ARCHITECTURE.md + CHANGELOG.md trong repo',
    ],
  },
  {
    version: 'Phase 7 New features',
    date: '2026-05-18',
    highlights: [
      'Provinces leaderboard tab (rank theo tổng đóng góp tỉnh)',
      'AI outage summary qua Claude Haiku 4.5 (optional)',
      'Coverage history modal — click chấm map xem time-series 12 tháng',
      'Heatmap timeline slider — animation playback theo tháng',
    ],
  },
  {
    version: 'Phase 6 Analytics',
    date: '2026-05-17',
    highlights: [
      'Vercel Analytics + Speed Insights tích hợp',
      'Custom event taxonomy 13 events (privacy-friendly)',
    ],
  },
  {
    version: 'Phase 5 Mobile PWA',
    date: '2026-05-17',
    highlights: [
      'iOS Safari "Add to Home Screen" instructions',
      'Enhanced manifest (display_override, shortcuts descriptions)',
    ],
  },
  {
    version: 'Phase 4 SEO',
    date: '2026-05-16',
    highlights: [
      'Dynamic Open Graph image 1200×630',
      'JSON-LD structured data (Organization + WebSite)',
      'Per-route metadata 5 trang chính',
      'Skip-to-content accessibility',
      'Google Search Console verified',
    ],
  },
  {
    version: 'Phase 3 Launch prep',
    date: '2026-05-15',
    highlights: [
      'DEMO banner cảnh báo dữ liệu mẫu',
      'Trang /terms + /privacy theo Nghị định 13/2023',
      'Trang /about giới thiệu mission + tech stack',
      'Contribute CTA + Footer với legal links',
    ],
  },
  {
    version: 'Phase 1 Production hardening',
    date: '2026-05-14',
    highlights: [
      '@fastify/helmet HSTS preload + security headers',
      'CORS strict + auto-allow *.penwin.vn + *.vercel.app',
      'JWT_SECRET 512-bit enforced trong production',
    ],
  },
  {
    version: 'v0.9 — Initial deployment',
    date: '2026-04-05',
    highlights: [
      'Frontend deploy Vercel sin1 + custom domain netmap.penwin.vn',
      'Backend deploy Railway asia-southeast1 + Postgres',
      'Demo data 3000 speed tests phủ 29 tỉnh VN',
      'MapLibre + MapTiler streets-v2 + 3D buildings',
      'Speed test, outage cluster, leaderboard, badges, push notification',
      'OTP SMS via eSMS.vn + 2-tier JWT auth',
      'i18n vi + en cookie-based',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Changelog</h1>
        <p className="mt-2 text-sm text-gray-600">
          Lịch sử thay đổi của NetMap VN. Xem thêm chi tiết tại{' '}
          <Link href="/roadmap" className="text-vnred-600 hover:underline">
            Roadmap
          </Link>{' '}
          cho tính năng sắp tới.
        </p>
      </header>

      <ol className="relative space-y-6 border-l-2 border-gray-200 pl-6">
        {ENTRIES.map((e, i) => (
          <li key={e.version} className="relative">
            <span
              className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                i === 0 ? 'bg-vnred-500' : 'bg-gray-400'
              }`}
              aria-hidden
            />
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold sm:text-lg">{e.version}</h2>
                <time className="text-xs text-gray-500" dateTime={e.date}>
                  {new Date(e.date).toLocaleDateString('vi-VN', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </time>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                {e.highlights.map((h, j) => (
                  <li key={j} className="flex gap-2">
                    <span aria-hidden className="text-vnred-500">·</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
