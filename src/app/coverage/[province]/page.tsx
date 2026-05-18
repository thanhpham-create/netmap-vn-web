// Province landing page — `/coverage/<slug>` ví dụ `/coverage/ha-noi`.
// SEO target: long-tail queries như "phủ sóng 5G Hà Nội", "tốc độ mạng TP HCM".
//
// Page là Server Component để có thể fetch + SSR cho crawler.
// Stats fetch ở server-side, không cần auth.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { PROVINCES, PROVINCE_BY_SLUG, regionLabel } from '@/lib/provinces';
import ShareButtons from '@/components/ShareButtons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// SSG: tạo static pages cho cả 30 tỉnh lúc build
export async function generateStaticParams() {
  return PROVINCES.map((p) => ({ province: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ province: string }>;
}): Promise<Metadata> {
  const { province: slug } = await params;
  const p = PROVINCE_BY_SLUG[slug];
  if (!p) return { title: 'Không tìm thấy tỉnh' };

  const title = `Phủ sóng 5G ${p.display} — Tốc độ mạng Viettel, VNPT, MobiFone`;
  const description = `Bản đồ phủ sóng và chất lượng mạng di động tại ${p.display}. So sánh tốc độ download, upload, ping giữa các nhà mạng. Dữ liệu cộng đồng cập nhật liên tục.`;
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `/coverage/${slug}`,
    },
  };
}

async function fetchProvinceStats(provinceName: string) {
  try {
    const res = await fetch(
      `${API_URL}/api/v1/carriers/compare?province=${encodeURIComponent(provinceName)}&days=30`,
      { next: { revalidate: 600 } },   // ISR 10 phút
    );
    if (!res.ok) return null;
    return (await res.json()) as {
      province: string; days: number; network: string;
      carriers: Array<{
        carrierName: string;
        testCount: number;
        avgDownloadMbps: number;
        avgUploadMbps: number;
        avgLatencyMs: number;
        medianDownloadMbps: number;
        pct5g: number;
        deviceCount: number;
        outageCount: number;
        verifiedOutages: number;
        reliabilityScore: number | null;
      }>;
    };
  } catch {
    return null;
  }
}

export default async function ProvincePage({
  params,
}: {
  params: Promise<{ province: string }>;
}) {
  const { province: slug } = await params;
  const p = PROVINCE_BY_SLUG[slug];
  if (!p) notFound();

  const locale = await getLocale();
  const isVN = locale === 'vi';
  const data = await fetchProvinceStats(p.dbName);
  const carriers = data?.carriers ?? [];
  const totalTests = carriers.reduce((s, c) => s + c.testCount, 0);
  const totalOutages = carriers.reduce((s, c) => s + c.outageCount, 0);

  const bestCarrier = carriers[0]; // sorted by avg download DESC from API
  const worstReliability = [...carriers].filter((c) => c.reliabilityScore !== null)
    .sort((a, b) => (a.reliabilityScore ?? 1) - (b.reliabilityScore ?? 1))[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-3 text-xs text-gray-500">
        <Link href="/" className="hover:text-vnred-600 hover:underline">{isVN ? 'Trang chủ' : 'Home'}</Link>
        <span className="mx-1.5">/</span>
        <Link href="/coverage" className="hover:text-vnred-600 hover:underline">{isVN ? 'Phủ sóng' : 'Coverage'}</Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-700">{p.display}</span>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-vnred-600">{regionLabel(p.region, locale)}</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900 sm:text-4xl">
          {isVN ? `Phủ sóng mạng di động ${p.display}` : `Mobile coverage in ${p.display}`}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
          {isVN
            ? `Dữ liệu cộng đồng từ ${totalTests} lượt đo speed test và ${totalOutages} báo cáo sự cố trong 30 ngày qua tại ${p.display}.`
            : `Crowdsourced data from ${totalTests} speed tests and ${totalOutages} outage reports in the last 30 days in ${p.display}.`}
        </p>
      </header>

      {/* Top stats cards */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <StatCard
          label={isVN ? 'Nhà mạng nhanh nhất' : 'Fastest carrier'}
          value={bestCarrier?.carrierName || '—'}
          sub={bestCarrier ? `↓ ${bestCarrier.avgDownloadMbps} Mbps` : (isVN ? 'Chưa đủ dữ liệu' : 'Not enough data')}
        />
        <StatCard
          label={isVN ? 'Tổng lượt đo' : 'Total tests'}
          value={String(totalTests)}
          sub={isVN ? 'trong 30 ngày qua' : 'in last 30 days'}
        />
        <StatCard
          label={isVN ? 'Tỷ lệ 5G cao nhất' : 'Highest 5G adoption'}
          value={bestCarrier ? `${bestCarrier.pct5g}%` : '—'}
          sub={bestCarrier ? bestCarrier.carrierName : ''}
        />
      </div>

      {/* Carriers comparison */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">
          {isVN ? `So sánh nhà mạng tại ${p.display}` : `Carrier comparison in ${p.display}`}
        </h2>
        {carriers.length === 0 ? (
          <div className="rounded-md border bg-white p-4 text-sm text-gray-500">
            {isVN
              ? `Chưa đủ dữ liệu cho ${p.display}. Hãy là người đầu tiên đóng góp!`
              : `Not enough data for ${p.display}. Be the first to contribute!`}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border bg-white shadow-sm">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">{isVN ? 'Nhà mạng' : 'Carrier'}</th>
                  <th className="px-3 py-2 text-right font-medium">↓ Mbps</th>
                  <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">↑ Mbps</th>
                  <th className="px-3 py-2 text-right font-medium">Ping</th>
                  <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">5G %</th>
                  <th className="px-3 py-2 text-right font-medium">{isVN ? 'Đo' : 'Tests'}</th>
                  <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">{isVN ? 'Sự cố' : 'Outages'}</th>
                </tr>
              </thead>
              <tbody>
                {carriers.map((c) => (
                  <tr key={c.carrierName} className="border-t">
                    <td className="px-3 py-2 font-medium">{c.carrierName}</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">{c.avgDownloadMbps}</td>
                    <td className="hidden px-3 py-2 text-right tabular-nums sm:table-cell">{c.avgUploadMbps}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{c.avgLatencyMs}ms</td>
                    <td className="hidden px-3 py-2 text-right tabular-nums sm:table-cell">{c.pct5g}%</td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-500">{c.testCount}</td>
                    <td className="hidden px-3 py-2 text-right tabular-nums sm:table-cell">
                      <span className={c.outageCount > 0 ? 'text-vnred-600' : 'text-gray-400'}>
                        {c.outageCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SEO-friendly content paragraphs */}
      <section className="mb-8 space-y-3 text-sm leading-relaxed text-gray-700">
        <h2 className="text-lg font-semibold">
          {isVN ? `Về phủ sóng mạng di động ${p.display}` : `About mobile coverage in ${p.display}`}
        </h2>
        {bestCarrier && (
          <p>
            {isVN
              ? `Tại ${p.display}, ${bestCarrier.carrierName} đang dẫn đầu về tốc độ download trung bình với ${bestCarrier.avgDownloadMbps} Mbps. Tỷ lệ kết nối 5G đạt ${bestCarrier.pct5g}%.`
              : `In ${p.display}, ${bestCarrier.carrierName} leads with average download speed of ${bestCarrier.avgDownloadMbps} Mbps. 5G connection ratio is ${bestCarrier.pct5g}%.`}
          </p>
        )}
        {worstReliability && worstReliability.reliabilityScore !== null && worstReliability.reliabilityScore < 0.95 && (
          <p>
            {isVN
              ? `${worstReliability.carrierName} có độ tin cậy thấp nhất với điểm reliability ${(worstReliability.reliabilityScore * 100).toFixed(1)}% — ghi nhận ${worstReliability.outageCount} báo cáo sự cố trong 30 ngày.`
              : `${worstReliability.carrierName} has the lowest reliability score at ${(worstReliability.reliabilityScore * 100).toFixed(1)}% — ${worstReliability.outageCount} outage reports in 30 days.`}
          </p>
        )}
        <p>
          {isVN
            ? `Số liệu được tổng hợp từ ${totalTests} lượt speed test do cộng đồng đóng góp. Bạn có thể giúp cải thiện độ chính xác bằng cách chạy speed test tại vị trí của bạn.`
            : `Data is aggregated from ${totalTests} community-contributed speed tests. You can help improve accuracy by running a speed test at your location.`}
        </p>
      </section>

      {/* CTA */}
      <section className="mb-8 rounded-xl border border-vnred-200 bg-gradient-to-br from-vnred-50 to-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">
              {isVN ? `Đóng góp dữ liệu cho ${p.display}` : `Contribute data for ${p.display}`}
            </p>
            <p className="mt-0.5 text-sm text-gray-600">
              {isVN
                ? 'Mỗi speed test giúp bản đồ thêm chính xác cho cộng đồng.'
                : 'Every speed test makes the map more accurate for everyone.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/speedtest"
              className="rounded-md bg-vnred-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-vnred-600"
            >
              ⚡ {isVN ? 'Chạy speed test' : 'Run speed test'}
            </Link>
            <Link
              href={`/?province=${encodeURIComponent(p.dbName)}`}
              className="rounded-md border border-vnred-300 bg-white px-4 py-2 text-center text-sm font-medium text-vnred-700 hover:bg-vnred-50"
            >
              🗺️ {isVN ? 'Xem trên bản đồ' : 'View on map'}
            </Link>
          </div>
        </div>
      </section>

      {/* Share */}
      <section className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {isVN ? 'Chia sẻ trang này' : 'Share this page'}
        </p>
        <ShareButtons />
      </section>

      {/* Other provinces */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-600">
          {isVN ? 'Xem phủ sóng tại tỉnh khác' : 'Browse other provinces'}
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {PROVINCES.filter((q) => q.slug !== p.slug)
            .slice(0, 12)
            .map((q) => (
              <Link
                key={q.slug}
                href={`/coverage/${q.slug}`}
                className="rounded-md border bg-white px-3 py-2 text-xs text-gray-700 hover:border-vnred-300 hover:bg-vnred-50"
              >
                {q.display}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p>
    </div>
  );
}
