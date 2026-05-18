// Index page cho /coverage — list 30 tỉnh nhóm theo miền Bắc/Trung/Nam.
// SEO target: "phủ sóng 5G Việt Nam", "bản đồ mạng di động Việt Nam".

import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { PROVINCES, regionLabel, type Province } from '@/lib/provinces';

export const metadata: Metadata = {
  title: 'Phủ sóng 5G & 4G theo tỉnh — NetMap VN',
  description:
    'Bản đồ phủ sóng mạng di động Việt Nam theo từng tỉnh thành. So sánh Viettel, VNPT, MobiFone, Vietnamobile, FPT, CMC.',
  alternates: { canonical: '/coverage' },
};

export default async function CoverageIndexPage() {
  const locale = await getLocale();
  const isVN = locale === 'vi';

  const byRegion = {
    north: PROVINCES.filter((p) => p.region === 'north'),
    central: PROVINCES.filter((p) => p.region === 'central'),
    south: PROVINCES.filter((p) => p.region === 'south'),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">
          {isVN ? 'Phủ sóng mạng di động Việt Nam' : 'Vietnam mobile coverage'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
          {isVN
            ? 'Chọn tỉnh để xem chi tiết tốc độ mạng, so sánh nhà mạng, và lịch sử sự cố. Dữ liệu cập nhật từ cộng đồng.'
            : 'Choose a province to see network speeds, carrier comparison, and outage history. Data updated by the community.'}
        </p>
      </header>

      {(['north', 'central', 'south'] as const).map((region) => (
        <Section
          key={region}
          title={regionLabel(region, locale)}
          provinces={byRegion[region]}
        />
      ))}
    </div>
  );
}

function Section({ title, provinces }: { title: string; provinces: Province[] }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-base font-semibold text-vnred-700">{title}</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {provinces.map((p) => (
          <Link
            key={p.slug}
            href={`/coverage/${p.slug}`}
            className="group flex items-center justify-between rounded-md border bg-white px-3 py-2.5 shadow-sm hover:border-vnred-300 hover:bg-vnred-50"
          >
            <span className="text-sm font-medium text-gray-700 group-hover:text-vnred-700">
              {p.display}
            </span>
            <span className="text-xs text-gray-400 group-hover:text-vnred-500">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
