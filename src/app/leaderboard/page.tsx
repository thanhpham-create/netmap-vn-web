'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { api, type LeaderboardEntry } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { EmptyState } from '@/components/Skeleton';

type Period = 'week' | 'month' | 'all';
type Kind = 'contributors' | 'speed-tests' | 'outages' | 'provinces';

export default function LeaderboardPage() {
  const t = useTranslations('leaderboard');
  const [period, setPeriod] = useState<Period>('month');
  const [kind, setKind] = useState<Kind>('contributors');
  const { tokens, user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', kind, period],
    queryFn: () => {
      if (kind === 'contributors') return api.leaderboardContributors(period);
      if (kind === 'speed-tests')  return api.leaderboardSpeedTests(period);
      if (kind === 'provinces')    return api.leaderboardProvinces(period, 20);
      return api.leaderboardOutages(period);
    },
  });

  const { data: meRank } = useQuery({
    queryKey: ['leaderboard', 'me', period],
    queryFn: () => api.leaderboardMe(tokens, period),
    enabled: !!tokens.userToken && !!user,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-sm text-gray-600">{t('subtitle')}</p>

      {/* Self rank */}
      {meRank && (
        <div className="rounded-md border bg-vnred-50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-vnred-700">{user?.displayName || user?.phone}</span>
            <span className="text-vnred-600">
              {meRank.rank
                ? t('myRank', { rank: meRank.rank, total: meRank.totalParticipants })
                : t('noStatsHint')}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-600">
            {t('stat_meta', { tests: meRank.stats.testCount, outages: meRank.stats.reportCount })} ({meRank.stats.verifiedCount} ✓)
            {' · '}<span className="font-semibold">{t('stat_score', { score: meRank.stats.score })}</span>
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {/* Kind tabs */}
        <div className="inline-flex flex-wrap rounded-md border bg-white text-sm">
          {(['contributors', 'speed-tests', 'outages', 'provinces'] as Kind[]).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`px-3 py-1.5 ${kind === k ? 'bg-vnred-500 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {k === 'contributors' ? t('kind_contributors')
                : k === 'speed-tests' ? t('kind_speed_tests')
                : k === 'provinces' ? t('kind_provinces')
                : t('kind_outages')}
            </button>
          ))}
        </div>

        {/* Period tabs */}
        <div className="inline-flex rounded-md border bg-white text-sm">
          {(['week', 'month', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 ${period === p ? 'bg-vnred-500 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {p === 'week' ? t('period_week') : p === 'month' ? t('period_month') : t('period_all')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">…</p>
      ) : kind === 'provinces' ? (
        <ProvinceTable data={data?.leaderboard as any[]} t={t} />
      ) : (
        <ol className="space-y-1 rounded-md border bg-white shadow-sm">
          {(data?.leaderboard as LeaderboardEntry[] || []).map((row) => (
            <Row key={row.userId} row={row} kind={kind} t={t} />
          ))}
          {(!data || data.leaderboard.length === 0) && (
            <li className="p-2">
              <EmptyState icon="🏆" title={t('noData')} hint={t('noDataHint')} />
            </li>
          )}
        </ol>
      )}
    </div>
  );
}

type ProvinceRow = {
  rank: number;
  province: string;
  testCount: number;
  uniqueDevices: number;
  reportCount: number;
  verifiedCount: number;
  score: number;
};

function ProvinceTable({ data, t }: { data: ProvinceRow[] | undefined; t: (k: string, v?: any) => string }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-md border bg-white p-4">
        <EmptyState icon="🗺️" title={t('noData')} hint={t('noDataHint')} />
      </div>
    );
  }
  return (
    <ol className="rounded-md border bg-white shadow-sm">
      {data.map((row) => {
        const medal = row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : null;
        return (
          <li
            key={row.province}
            className="flex items-center justify-between border-b px-4 py-3 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 text-center font-semibold text-gray-700">
                {medal || `#${row.rank}`}
              </span>
              <div>
                <span className="font-medium">{row.province}</span>
                <p className="text-xs text-gray-500">
                  {t('uniqueDevices', { count: row.uniqueDevices })}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <span className="font-semibold text-vnred-600">
                {t('stat_score', { score: row.score })}
              </span>
              <div className="text-xs text-gray-400">
                {t('stat_meta', { tests: row.testCount, outages: row.reportCount })}
                {row.verifiedCount > 0 && (
                  <span className="ml-1 text-green-600">({row.verifiedCount} ✓)</span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Row({ row, kind, t }: { row: LeaderboardEntry; kind: Kind; t: (k: string, v?: any) => string }) {
  const medal = row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : null;
  return (
    <li className="flex items-center justify-between border-b px-4 py-3 last:border-0">
      <div className="flex items-center gap-3">
        <span className="w-8 text-center font-semibold text-gray-700">
          {medal || `#${row.rank}`}
        </span>
        <div>
          <span className="font-medium">{row.displayName}</span>
          {row.topBadges && row.topBadges.length > 0 && (
            <span className="ml-2 inline-flex gap-0.5" title={t('badgeCount', { count: row.badgeCount ?? 0 })}>
              {row.topBadges.map((e, i) => <span key={i}>{e}</span>)}
            </span>
          )}
        </div>
      </div>
      <div className="text-right text-sm text-gray-600">
        {kind === 'contributors' && (
          <>
            <span className="font-semibold text-vnred-600">{t('stat_score', { score: row.score })}</span>
            <span className="ml-2 text-xs text-gray-400">
              {t('stat_meta', { tests: row.testCount, outages: row.reportCount })}
            </span>
          </>
        )}
        {kind === 'speed-tests' && <span className="font-semibold">{t('stat_tests', { count: row.testCount })}</span>}
        {kind === 'outages' && (
          <span className="font-semibold">
            {t('stat_outages', { count: row.reportCount })}
            <span className="ml-2 text-xs text-green-600">{row.verifiedCount} ✓</span>
          </span>
        )}
      </div>
    </li>
  );
}
