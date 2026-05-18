// Index page cho /carriers — list 6 nhà mạng với card preview.
// SEO: "danh sách nhà mạng Việt Nam", "so sánh nhà mạng".

import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { CARRIERS } from '@/lib/carriers';

export const metadata: Metadata = {
  title: 'Các nhà mạng di động Việt Nam — Tốc độ, phủ sóng, sự cố',
  description:
    'Tổng quan 6 nhà mạng di động Việt Nam: Viettel, VNPT, MobiFone, Vietnamobile, FPT, CMC. Tốc độ, phủ sóng, độ ổn định theo dữ liệu cộng đồng.',
  alternates: { canonical: '/carriers' },
};

export default async function CarriersIndexPage() {
  const locale = await getLocale();
  const isVN = locale === 'vi';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">
          {isVN ? 'Các nhà mạng di động Việt Nam' : 'Vietnam mobile carriers'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
          {isVN
            ? '6 nhà mạng hoạt động chính: Viettel, VNPT, MobiFone, Vietnamobile, FPT, CMC. Click vào từng nhà mạng để xem stats riêng.'
            : '6 active major carriers in Vietnam. Click each carrier for detailed stats.'}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARRIERS.map((c) => (
          <Link
            key={c.slug}
            href={`/carriers/${c.slug}`}
            className="group flex items-start gap-3 rounded-lg border bg-white p-4 shadow-sm transition hover:border-vnred-300 hover:shadow-md"
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white"
              style={{ background: c.color }}
            >
              {c.display[0]}
            </div>
            <div className="flex-1">
              <p className="font-semibold group-hover:text-vnred-700">{c.display}</p>
              {c.tagline && <p className="mt-0.5 text-xs text-gray-500">{c.tagline}</p>}
              {c.asn && c.asn.length > 0 && (
                <p className="mt-1 text-[10px] text-gray-400">
                  {c.asn.map((n) => `AS${n}`).join(' · ')}
                </p>
              )}
            </div>
            <span className="text-xs text-gray-400 group-hover:text-vnred-500">→</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-md border bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-medium">💡 {isVN ? 'Mẹo' : 'Tip'}</p>
        <p className="mt-1">
          {isVN
            ? 'Trang /compare giúp so sánh trực tiếp 2 hay nhiều nhà mạng theo tỉnh, thời gian, loại mạng.'
            : 'The /compare page lets you compare carriers head-to-head by province, time, network type.'}
          {' '}
          <Link href="/compare" className="font-medium underline hover:text-blue-700">
            {isVN ? 'Mở trang so sánh →' : 'Open compare page →'}
          </Link>
        </p>
      </div>
    </div>
  );
}
