'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useTranslations, useLocale } from 'next-intl';
import NotificationToggle from '@/components/NotificationToggle';
import { BadgeCard, BadgeChip } from '@/components/BadgeChip';
import { SkeletonCard, EmptyState } from '@/components/Skeleton';

export default function MePage() {
  const t = useTranslations('me');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tokens, user, logout, isReady } = useAuth();

  const { data: meRank } = useQuery({
    queryKey: ['leaderboard', 'me', 'month'],
    queryFn: () => api.leaderboardMe(tokens, 'month'),
    enabled: !!user && !!tokens.userToken,
  });

  const { data: activity, isLoading: loadingActivity } = useQuery({
    queryKey: ['me', 'activity'],
    queryFn: () => api.myActivity(tokens, 20),
    enabled: !!user && !!tokens.userToken,
  });

  const { data: badges } = useQuery({
    queryKey: ['me', 'badges'],
    queryFn: () => api.myBadges(tokens),
    enabled: !!user && !!tokens.userToken,
  });

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [savingName, setSavingName] = useState(false);

  if (!isReady) return <div className="p-6 text-sm text-gray-500">{tCommon('loading')}</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md p-6">
        <p className="rounded-md border bg-yellow-50 p-3 text-sm text-yellow-800">
          {t('notLoggedIn')}{' '}
          <button onClick={() => router.push('/login')} className="font-medium text-vnred-600 hover:underline">
            {t('signIn')}
          </button>
        </p>
      </div>
    );
  }

  async function saveName() {
    if (!newName.trim()) return;
    setSavingName(true);
    try {
      await api.updateMe({ displayName: newName.trim() }, tokens);
      // Optimistic update local state via auth — quick & dirty: refresh
      window.location.reload();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
      setSavingName(false);
    }
  }

  const isAdmin = user.role === 'admin' || user.role === 'operator';

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {/* Profile card */}
      <section className="rounded-md border bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{t('displayName')}</p>
            {editingName ? (
              <div className="mt-1 flex gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded border px-2 py-1 text-lg font-semibold"
                  maxLength={80}
                />
                <button
                  onClick={saveName}
                  disabled={savingName}
                  className="rounded bg-vnred-500 px-3 py-1 text-sm font-medium text-white"
                >
                  {savingName ? t('saving') : t('save')}
                </button>
                <button
                  onClick={() => { setEditingName(false); setNewName(user.displayName || ''); }}
                  className="rounded border px-3 py-1 text-sm"
                >
                  {t('cancel')}
                </button>
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                <p className="text-lg font-semibold">{user.displayName || t('notSet')}</p>
                <button
                  onClick={() => { setEditingName(true); setNewName(user.displayName || ''); }}
                  className="text-xs text-vnred-600 hover:underline"
                >
                  {t('edit')}
                </button>
              </div>
            )}
            <p className="mt-2 text-sm text-gray-600">{t('phone')}: <span className="font-mono">{user.phone}</span></p>
            <p className="text-xs text-gray-500">
              {t('role')}: <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium">{user.role}</span>
            </p>
          </div>
          <button
            onClick={() => { logout(); queryClient.clear(); router.push('/'); }}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            {t('logout')}
          </button>
        </div>
      </section>

      {/* Stats summary */}
      {meRank && (
        <section className="rounded-md border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">{t('contributions')}</h2>
          <div className="grid grid-cols-4 gap-2 text-center">
            <Stat label={t('stat_test')} value={meRank.stats.testCount} />
            <Stat label={t('stat_outage')} value={meRank.stats.reportCount} />
            <Stat label={t('stat_verified')} value={meRank.stats.verifiedCount} />
            <Stat label={t('stat_score')} value={meRank.stats.score} highlight />
          </div>
          {meRank.rank && (
            <p className="mt-3 text-center text-sm text-gray-600">
              {t('rank', { rank: meRank.rank, total: meRank.totalParticipants })}
            </p>
          )}
        </section>
      )}

      {/* Badges */}
      {badges && (
        <section className="rounded-md border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{t('badges')}</h2>
            <span className="text-sm text-gray-500">
              {badges.earnedCount}/{badges.totalCount}
            </span>
          </div>
          {badges.earnedCount > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {badges.badges.filter((b) => b.earned).map((b) => (
                <BadgeChip key={b.id} emoji={b.emoji} name={b.name} size="sm" />
              ))}
            </div>
          )}
          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
              <span className="group-open:hidden">{t('viewAllBadges')}</span>
              <span className="hidden group-open:inline">{t('close')}</span>
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {badges.badges.map((b) => (
                <BadgeCard
                  key={b.id}
                  emoji={b.emoji}
                  name={b.name}
                  description={b.description}
                  earned={b.earned}
                  progress={b.progress}
                  threshold={b.threshold}
                />
              ))}
            </div>
          </details>
        </section>
      )}

      {/* Notifications */}
      <section className="rounded-md border bg-white p-4 shadow-sm">
        <NotificationToggle />
      </section>

      {/* Admin link */}
      {isAdmin && (
        <section className="rounded-md border border-purple-200 bg-purple-50 p-3">
          <button
            onClick={() => router.push('/admin')}
            className="text-sm font-medium text-purple-700 hover:underline"
          >
            {t('openAdmin', { role: user.role })}
          </button>
        </section>
      )}

      {/* Activity feed */}
      <section className="rounded-md border bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold">{t('activity')}</h2>
        {loadingActivity && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
            <div className="space-y-2">
              <SkeletonCard /><SkeletonCard />
            </div>
          </div>
        )}
        {activity && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">{t('recentTests')}</h3>
              {activity.tests.length === 0 ? (
                <EmptyState icon="📡" title={t('noTests')} hint={t('noTestsHint')} />
              ) : (
                <ul className="space-y-1.5">
                  {activity.tests.slice(0, 10).map((item) => (
                    <li key={item.id} className="rounded border bg-gray-50 p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.carrierName} · {item.networkType}</span>
                        <span className="text-gray-500">{new Date(item.recordedAt).toLocaleDateString(locale)}</span>
                      </div>
                      <p className="mt-0.5 text-gray-600">
                        {item.downloadMbps}↓ · {item.uploadMbps}↑ Mbps · {item.latencyMs}ms
                      </p>
                      {item.province && <p className="text-gray-400">{item.district}, {item.province}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">{t('recentReports')}</h3>
              {activity.outages.length === 0 ? (
                <EmptyState icon="🔍" title={t('noReports')} hint={t('noReportsHint')} />
              ) : (
                <ul className="space-y-1.5">
                  {activity.outages.slice(0, 10).map((o) => (
                    <li key={o.id} className="rounded border bg-gray-50 p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{o.carrierName} · {o.outageType}</span>
                        <span className="text-gray-500">{new Date(o.reportedAt).toLocaleDateString(locale)}</span>
                      </div>
                      <p className="mt-0.5 text-gray-500">
                        Cluster {o.clusterSize}{o.isVerified ? ' · ✓ verified' : ''}
                        {o.resolvedAt ? ' · resolved' : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded p-2 ${highlight ? 'bg-vnred-50' : 'bg-gray-50'}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${highlight ? 'text-vnred-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}
