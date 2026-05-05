'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { EmptyState, SkeletonCard } from '@/components/Skeleton';

export default function AdminPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tokens, user, isReady } = useAuth();

  // Role gate
  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.replace('/login'); return; }
    if (user.role !== 'admin' && user.role !== 'operator') router.replace('/');
  }, [isReady, user, router]);

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.adminStats(tokens),
    enabled: !!user && (user.role === 'admin' || user.role === 'operator'),
    refetchInterval: 60_000,
  });

  const { data: outages } = useQuery({
    queryKey: ['admin', 'recent-outages'],
    queryFn: () => api.adminRecentOutages(tokens, { limit: 30 }),
    enabled: !!user && (user.role === 'admin' || user.role === 'operator'),
    refetchInterval: 60_000,
  });

  const resolveMutation = useMutation({
    mutationFn: (id: number) => api.resolveOutage(id, tokens),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'recent-outages'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });

  if (!isReady || !user) return <div className="p-6 text-sm text-gray-500">{t('checkingAccess')}</div>;
  if (user.role !== 'admin' && user.role !== 'operator') return null;

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <span className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
          {user.role}
        </span>
      </div>

      {/* Stats grid */}
      {stats && (
        <>
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card label={t('stat_users')} value={stats.totals.totalUsers} />
            <Card label={t('stat_devices')} value={stats.totals.activeDevices7d} sub={t('stat_devices_total', { total: stats.totals.totalDevices })} />
            <Card label={t('stat_tests_24h')} value={stats.totals.tests24h} sub={t('stat_tests_total', { total: stats.totals.totalTests })} />
            <Card label={t('stat_outages_24h')} value={stats.totals.activeOutages24h} sub={t('stat_outages_verified', { count: stats.totals.verifiedOutages24h })} highlight={stats.totals.activeOutages24h > 0} />
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Carrier breakdown */}
            <section className="rounded-md border bg-white p-4 shadow-sm">
              <h2 className="mb-2 font-semibold">{t('carriers7d')}</h2>
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500">
                  <tr>
                    <th className="text-left">{t('headerCarrier')}</th>
                    <th className="text-right">{t('headerTests')}</th>
                    <th className="text-right">{t('headerAvgDown')}</th>
                    <th className="text-right">{t('headerPing')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.carrierBreakdown.map((c) => (
                    <tr key={c.carrierName} className="border-t">
                      <td className="py-1.5 font-medium">{c.carrierName}</td>
                      <td className="py-1.5 text-right tabular-nums">{c.testCount.toLocaleString(locale)}</td>
                      <td className="py-1.5 text-right tabular-nums">{c.avgDownload} Mbps</td>
                      <td className="py-1.5 text-right tabular-nums">{c.avgLatency}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Outage hotspots */}
            <section className="rounded-md border bg-white p-4 shadow-sm">
              <h2 className="mb-2 font-semibold">{t('topProvinces')}</h2>
              {stats.topProblematicProvinces.length === 0 ? (
                <p className="text-sm text-gray-500">{t('noOutages7d')}</p>
              ) : (
                <ul className="space-y-1">
                  {stats.topProblematicProvinces.map((p) => (
                    <li key={p.province} className="flex items-center justify-between text-sm">
                      <span>{p.province}</span>
                      <span className="font-medium tabular-nums">{p.reportCount}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}

      {/* Recent outages */}
      <section className="rounded-md border bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold">{t('recentActive')}</h2>
        <div className="space-y-2">
          {(outages?.outages || []).map((o) => (
            <div key={o.id} className="flex flex-col gap-2 rounded border bg-gray-50 p-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{o.carrierName}</span>
                  <span className="rounded bg-vnred-50 px-1.5 py-0.5 text-xs text-vnred-700">{o.outageType}</span>
                  {o.isVerified && <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">{t('verified')}</span>}
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  {t('cluster', { size: o.clusterSize })} · {new Date(o.reportedAt).toLocaleString(locale)}
                </p>
                {(o.province || o.district || o.ward) && (
                  <p className="text-xs text-gray-500">{[o.ward, o.district, o.province].filter(Boolean).join(', ')}</p>
                )}
                {o.description && <p className="mt-1 text-xs text-gray-600">"{o.description}"</p>}
              </div>
              <button
                onClick={() => resolveMutation.mutate(o.id)}
                disabled={resolveMutation.isPending}
                className="shrink-0 rounded border border-green-500 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50 sm:ml-3 sm:py-1"
              >
                {t('resolve')}
              </button>
            </div>
          ))}
          {outages?.outages.length === 0 && (
            <EmptyState icon="✓" title={t('noActiveOutages')} hint={t('stable')} />
          )}
          {!outages && (
            <div className="space-y-2">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Card({ label, value, sub, highlight = false }: { label: string; value: number; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-md border bg-white p-3 shadow-sm ${highlight ? 'border-vnred-300' : ''}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${highlight ? 'text-vnred-600' : 'text-gray-900'}`}>
        {value.toLocaleString('vi-VN')}
      </p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
    </div>
  );
}
