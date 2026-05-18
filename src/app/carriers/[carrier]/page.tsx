// Carrier landing page — `/carriers/<slug>` ví dụ `/carriers/viettel`.
// SEO target: "tốc độ mạng Viettel", "Viettel 5G", "VNPT outage".
//
// Fetch overall stats (nationwide, days=30) cộng với top 5 tỉnh tốc độ cao nhất.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { CARRIERS, CARRIER_BY_SLUG } from '@/lib/carriers';
import { PROVINCES } from '@/lib/provinces';
import ShareButtons from '@/components/ShareButtons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function generateStaticParams() {
  return CARRIERS.map((c) => ({ carrier: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ carrier: string }>;
}): Promise<Metadata> {
  const { carrier: slug } = await params;
  const c = CARRIER_BY_SLUG[slug];
  if (!c) return { title: 'Không tìm thấy nhà mạng' };

  const title = `${c.display} — Tốc độ mạng, phủ sóng 5G, báo cáo sự cố`;
  const description = `${c.display}: tốc độ download/upload trung bình, tỷ lệ phủ sóng 5G, độ ổn định mạng trên toàn quốc. Dữ liệu cộng đồng cập nhật real-time.`;
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `/carriers/${slug}` },
  };
}

async function fetchNationwide(carrierName: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/carriers/compare?days=30`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.carriers ?? []).find((x: any) => x.carrierName === carrierName) || null;
  } catch {
    return null;
  }
}

/** Fetch tất cả tỉnh, lọc carrier, sort theo avgDownloadMbps. */
async function fetchTopProvinces(carrierName: string) {
  const results: Array<{ province: string; avgDownloadMbps: number; testCount: number }> = [];
  // Fetch parallel cho 30 tỉnh
  await Promise.all(
    PROVINCES.map(async (p) => {
      try {
        const res = await fetch(
          `${API_URL}/api/v1/carriers/compare?province=${encodeURIComponent(p.dbName)}&days=30`,
          { next: { revalidate: 600 } },
        );
        if (!res.ok) return;
        const json = await res.json();
        const row = (json.carriers ?? []).find((x: any) => x.carrierName === carrierName);
        if (row && row.testCount >= 3) {
          results.push({
            province: p.display,
            avgDownloadMbps: row.avgDownloadMbps,
            testCount: row.testCount,
          });
        }
      } catch { /* skip */ }
    }),
  );
  return results
    .sort((a, b) => b.avgDownloadMbps - a.avgDownloadMbps)
    .slice(0, 10);
}

export default async function CarrierPage({
  params,
}: {
  params: Promise<{ carrier: string }>;
}) {
  const { carrier: slug } = await params;
  const c = CARRIER_BY_SLUG[slug];
  if (!c) notFound();

  const locale = await getLocale();
  const isVN = locale === 'vi';

  const [overall, topProvinces] = await Promise.all([
    fetchNationwide(c.dbName),
    fetchTopProvinces(c.dbName),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-3 text-xs text-gray-500">
        <Link href="/" className="hover:text-vnred-600 hover:underline">{isVN ? 'Trang chủ' : 'Home'}</Link>
        <span className="mx-1.5">/</span>
        <Link href="/carriers" className="hover:text-vnred-600 hover:underline">{isVN ? 'Nhà mạng' : 'Carriers'}</Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-700">{c.display}</span>
      </nav>

      <header className="mb-6 flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white text-lg font-bold shadow-md sm:h-16 sm:w-16 sm:text-xl"
          style={{ background: c.color }}
        >
          {c.display[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{c.display}</h1>
          {c.tagline && <p className="mt-1 text-sm text-gray-600">{c.tagline}</p>}
          {c.asn && c.asn.length > 0 && (
            <p className="mt-1 text-xs text-gray-400">
              ASN: {c.asn.map((n) => `AS${n}`).join(', ')}
            </p>
          )}
        </div>
      </header>

      {/* Overall stats */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">
          {isVN ? `Chất lượng mạng ${c.display} 30 ngày qua` : `${c.display} network quality — last 30 days`}
        </h2>
        {!overall ? (
          <div className="rounded-md border bg-white p-4 text-sm text-gray-500">
            {isVN ? 'Chưa đủ dữ liệu cho nhà mạng này.' : 'Not enough data for this carrier yet.'}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-4">
            <StatCard label="↓ Download" value={`${overall.avgDownloadMbps}`} unit="Mbps" />
            <StatCard label="↑ Upload"   value={`${overall.avgUploadMbps}`}   unit="Mbps" />
            <StatCard label="Ping"       value={`${overall.avgLatencyMs}`}     unit="ms" />
            <StatCard label="5G ratio"   value={`${overall.pct5g}`}            unit="%" />
          </div>
        )}
      </section>

      {/* Top provinces */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">
          {isVN ? `Top tỉnh tốc độ ${c.display} cao nhất` : `Top provinces by ${c.display} speed`}
        </h2>
        {topProvinces.length === 0 ? (
          <div className="rounded-md border bg-white p-4 text-sm text-gray-500">
            {isVN ? 'Chưa có data per-province cho nhà mạng này.' : 'No per-province data yet.'}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">{isVN ? 'Tỉnh' : 'Province'}</th>
                  <th className="px-3 py-2 text-right font-medium">↓ Mbps</th>
                  <th className="px-3 py-2 text-right font-medium">{isVN ? 'Lượt đo' : 'Tests'}</th>
                </tr>
              </thead>
              <tbody>
                {topProvinces.map((p, i) => {
                  const provinceMeta = PROVINCES.find((pp) => pp.display === p.province);
                  return (
                    <tr key={p.province} className="border-t">
                      <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">
                        {provinceMeta ? (
                          <Link href={`/coverage/${provinceMeta.slug}`} className="hover:text-vnred-600 hover:underline">
                            {p.province}
                          </Link>
                        ) : (
                          p.province
                        )}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold">{p.avgDownloadMbps}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-500">{p.testCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="rounded-xl border border-vnred-200 bg-gradient-to-br from-vnred-50 to-white p-5">
        <p className="font-semibold">
          {isVN ? `Đo tốc độ ${c.display} của bạn?` : `Test your ${c.display} speed?`}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          {isVN
            ? 'Đóng góp 1 speed test giúp số liệu trên trang này thêm chính xác cho cộng đồng.'
            : 'One speed test contribution helps the numbers on this page get more accurate.'}
        </p>
        <Link
          href="/speedtest"
          className="mt-3 inline-block rounded-md bg-vnred-500 px-4 py-2 text-sm font-medium text-white hover:bg-vnred-600"
        >
          ⚡ {isVN ? 'Chạy speed test' : 'Run speed test'}
        </Link>
      </section>

      {/* Share */}
      <section className="mt-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {isVN ? 'Chia sẻ trang này' : 'Share this page'}
        </p>
        <ShareButtons />
      </section>

      {/* Other carriers */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-gray-600">
          {isVN ? 'Xem các nhà mạng khác' : 'Browse other carriers'}
        </h2>
        <div className="flex flex-wrap gap-2">
          {CARRIERS.filter((q) => q.slug !== c.slug).map((q) => (
            <Link
              key={q.slug}
              href={`/carriers/${q.slug}`}
              className="rounded-md border bg-white px-3 py-1.5 text-xs hover:border-vnred-300 hover:bg-vnred-50"
              style={{ borderLeftColor: q.color, borderLeftWidth: 3 }}
            >
              {q.display}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">
        {value} <span className="text-xs font-normal text-gray-400">{unit}</span>
      </p>
    </div>
  );
}
