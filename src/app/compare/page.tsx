'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';

const CARRIER_COLORS: Record<string, string> = {
  Viettel:      '#ee0033',
  VNPT:         '#005bbb',
  MobiFone:     '#1a76d4',
  Vietnamobile: '#ff6600',
};

export default function ComparePage() {
  const t = useTranslations('compare');
  const [province, setProvince] = useState('');
  const [days, setDays] = useState(30);
  const [network, setNetwork] = useState('');

  const { data: provincesData } = useQuery({
    queryKey: ['carriers', 'provinces'],
    queryFn: () => api.carrierProvinces(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['carriers', 'compare', province, days, network],
    queryFn: () => api.compareCarriers({
      province: province || undefined,
      days,
      network: network || undefined,
    }),
  });

  // Find max download for bar chart scaling
  const maxDownload = Math.max(...((data?.carriers || []).map((c) => c.avgDownloadMbps)), 1);

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-sm text-gray-600">{t('subtitle')}</p>

      {/* Filters */}
      <div className="rounded-md border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block text-sm">
            <span className="font-medium text-gray-700">{t('region')}</span>
            <select value={province} onChange={(e) => setProvince(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2">
              <option value="">{t('nationwide')}</option>
              {(provincesData?.provinces || []).map((p) => (
                <option key={p.province} value={p.province}>{p.province} ({t('testsCount', { count: p.testCount })})</option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="font-medium text-gray-700">{t('period')}</span>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-md border px-3 py-2">
              <option value={7}>{t('period_7d')}</option>
              <option value={30}>{t('period_30d')}</option>
              <option value={90}>{t('period_90d')}</option>
              <option value={365}>{t('period_1y')}</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="font-medium text-gray-700">{t('networkType')}</span>
            <select value={network} onChange={(e) => setNetwork(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2">
              <option value="">{t('all')}</option>
              <option value="5G">5G</option>
              <option value="5G-NSA">5G-NSA</option>
              <option value="4G+">4G+</option>
              <option value="4G">4G</option>
              <option value="3G">3G</option>
            </select>
          </label>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">…</p>
      ) : !data?.carriers.length ? (
        <p className="rounded-md border bg-yellow-50 p-4 text-sm text-yellow-800">
          {t('noData')}
        </p>
      ) : (
        <>
          {/* Bar chart: avg download */}
          <section className="rounded-md border bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-semibold">{t('avgDownload')}</h2>
            <div className="space-y-2">
              {data.carriers.map((c) => {
                const width = (c.avgDownloadMbps / maxDownload) * 100;
                return (
                  <div key={c.carrierName}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{c.carrierName}</span>
                      <span className="tabular-nums">{c.avgDownloadMbps} Mbps</span>
                    </div>
                    <div className="mt-1 h-3 overflow-hidden rounded bg-gray-100">
                      <div
                        className="h-full rounded transition-all"
                        style={{
                          width: `${width}%`,
                          backgroundColor: CARRIER_COLORS[c.carrierName] || '#888',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Detail table */}
          <section className="overflow-hidden rounded-md border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-semibold">{t('details')}</h2>
              <span className="text-xs text-gray-400 md:hidden">{t('swipeHint')}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-3 py-2 text-left">{t('carrier')}</th>
                    <th className="px-3 py-2 text-right">{t('downAvg')}</th>
                    <th className="px-3 py-2 text-right">{t('downMedian')}</th>
                    <th className="px-3 py-2 text-right">{t('upAvg')}</th>
                    <th className="px-3 py-2 text-right">{t('ping')}</th>
                    <th className="px-3 py-2 text-right">{t('pct5g')}</th>
                    <th className="px-3 py-2 text-right">{t('tests')}</th>
                    <th className="px-3 py-2 text-right">{t('devices')}</th>
                    <th className="px-3 py-2 text-right">{t('outagesCol')}</th>
                    <th className="px-3 py-2 text-right">{t('reliability')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.carriers.map((c) => (
                    <tr key={c.carrierName} className="border-t">
                      <td className="px-3 py-2 font-medium" style={{ color: CARRIER_COLORS[c.carrierName] }}>
                        {c.carrierName}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{c.avgDownloadMbps}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-500">{c.medianDownloadMbps}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{c.avgUploadMbps}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{c.avgLatencyMs}ms</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        <span className={c.pct5g >= 30 ? 'font-semibold text-green-600' : ''}>{c.pct5g}%</span>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{c.testCount.toLocaleString('vi-VN')}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-500">{c.deviceCount}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {c.outageCount > 0 ? (
                          <span className="text-vnred-600">{c.outageCount}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {c.reliabilityScore !== null ? (
                          <ReliabilityBadge score={c.reliabilityScore} />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="text-xs text-gray-500">
            {t('footer', { province: data.province, days: data.days, network: data.network })}
          </p>
        </>
      )}
    </div>
  );
}

function ReliabilityBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    score >= 0.95 ? 'bg-green-100 text-green-800'
    : score >= 0.85 ? 'bg-yellow-100 text-yellow-800'
    : 'bg-red-100 text-red-800';
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      {pct}%
    </span>
  );
}
