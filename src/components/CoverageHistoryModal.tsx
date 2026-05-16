'use client';

// Modal hiển thị lịch sử speed test tại 1 toạ độ trong N tháng qua.
// Trigger từ popup của CoverageMap khi user click "Xem lịch sử".
//
// Layout: Table grouped by month, mỗi row có carrier + download bar chart inline.

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';

const CARRIER_COLOR: Record<string, string> = {
  Viettel:      '#ee0033',
  VNPT:         '#005bbb',
  MobiFone:     '#1a76d4',
  Vietnamobile: '#ff6600',
  FPT:          '#22c55e',
  CMC:          '#a855f7',
};

type Props = {
  lat: number;
  lng: number;
  onClose: () => void;
};

export default function CoverageHistoryModal({ lat, lng, onClose }: Props) {
  const t = useTranslations('historyModal');
  const [months, setMonths] = useState(6);

  const { data, isLoading } = useQuery({
    queryKey: ['coverage-history', lat, lng, months],
    queryFn: () => api.coverageHistory({ lat, lng, radius: 500, months }),
  });

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Max download for bar scaling
  const maxDownload = Math.max(
    100,
    ...(data?.history.map((r) => r.avg_download_mbps) || []),
  );

  // Group rows by month
  const byMonth: Record<string, typeof data extends undefined ? never : NonNullable<typeof data>['history']> = {};
  data?.history.forEach((r) => {
    if (!byMonth[r.month]) byMonth[r.month] = [] as any;
    (byMonth[r.month] as any).push(r);
  });
  const monthsSorted = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-t-xl bg-white shadow-2xl sm:rounded-xl"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <h2 className="text-base font-semibold sm:text-lg">{t('title')}</h2>
            <p className="text-xs text-gray-500">
              📍 {lat.toFixed(5)}, {lng.toFixed(5)} · {t('radius', { meters: 500 })}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <span aria-hidden className="text-xl leading-none">×</span>
          </button>
        </header>

        {/* Months filter */}
        <div className="flex flex-wrap gap-2 border-b px-4 py-2 sm:px-5">
          {[3, 6, 12, 24].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`rounded-md px-2.5 py-1 text-xs ${
                months === m
                  ? 'bg-vnred-500 text-white'
                  : 'border bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('months', { count: m })}
            </button>
          ))}
          {data && (
            <span className="ml-auto self-center text-xs text-gray-500">
              {t('totalSamples', { count: data.totalSamples })}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5">
          {isLoading && <p className="text-sm text-gray-500">{t('loading')}</p>}

          {!isLoading && monthsSorted.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500">
              <p className="text-3xl">📡</p>
              <p className="mt-2">{t('noData')}</p>
              <p className="mt-1 text-xs text-gray-400">{t('noDataHint')}</p>
            </div>
          )}

          {!isLoading && monthsSorted.map((month) => (
            <section key={month} className="mb-4 last:mb-0">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {formatMonth(month)}
              </h3>
              <div className="overflow-hidden rounded-md border bg-white">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-2.5 py-1.5 text-left font-medium">{t('carrier')}</th>
                      <th className="px-2.5 py-1.5 text-right font-medium">↓ Mbps</th>
                      <th className="hidden px-2.5 py-1.5 text-right font-medium sm:table-cell">↑ Mbps</th>
                      <th className="px-2.5 py-1.5 text-right font-medium">Ping</th>
                      <th className="px-2.5 py-1.5 text-right font-medium">{t('tests')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(byMonth[month] as any[]).map((r, i) => (
                      <tr key={`${r.carrier_name}-${r.network_type}-${i}`} className="border-t">
                        <td className="px-2.5 py-1.5">
                          <span
                            className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle"
                            style={{ background: CARRIER_COLOR[r.carrier_name] || '#888' }}
                          />
                          <span className="font-medium">{r.carrier_name}</span>
                          <span className="ml-1 text-[10px] text-gray-400">{r.network_type}</span>
                        </td>
                        <td className="px-2.5 py-1.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-100 sm:w-16">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(100, (r.avg_download_mbps / maxDownload) * 100)}%`,
                                  background: CARRIER_COLOR[r.carrier_name] || '#888',
                                }}
                              />
                            </div>
                            <span className="tabular-nums font-semibold">{r.avg_download_mbps}</span>
                          </div>
                        </td>
                        <td className="hidden px-2.5 py-1.5 text-right tabular-nums sm:table-cell">
                          {r.avg_upload_mbps}
                        </td>
                        <td className="px-2.5 py-1.5 text-right tabular-nums">{r.avg_latency_ms}ms</td>
                        <td className="px-2.5 py-1.5 text-right tabular-nums text-gray-500">{r.sample_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split('-');
  return `${m}/${y}`;
}
