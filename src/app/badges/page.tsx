'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BadgeCard } from '@/components/BadgeChip';

export default function BadgesPage() {
  const t = useTranslations('badges');
  const tNav = useTranslations('nav');
  const CATEGORY_LABEL: Record<string, string> = {
    tests:    t('category_tests'),
    outages:  t('category_outages'),
    coverage: t('category_coverage'),
    speed:    t('category_speed'),
  };
  const { tokens, user } = useAuth();

  const { data: all } = useQuery({
    queryKey: ['badges', 'all'],
    queryFn: () => api.allBadges(),
  });

  const { data: my } = useQuery({
    queryKey: ['me', 'badges'],
    queryFn: () => api.myBadges(tokens),
    enabled: !!user && !!tokens.userToken,
  });

  // Use my-progress data if logged in, else just show all badges as locked
  const badges = my?.badges
    ?? all?.badges.map((b) => ({ ...b, earned: false, progress: 0 }))
    ?? [];

  // Group by category
  const grouped = badges.reduce<Record<string, typeof badges>>((acc, b) => {
    (acc[b.category] = acc[b.category] || []).push(b);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-sm text-gray-600">
        {t('subtitle')}{' '}
        {!user && (
          <span>
            <a href="/login" className="text-vnred-600 hover:underline">{tNav('login')}</a>{' '}
            {t('loginPrompt')}
          </span>
        )}
      </p>

      {my && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
          <span className="text-amber-700">
            {t('earnedSummary', { earned: my.earnedCount, total: my.totalCount })}
          </span>
        </div>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <h2 className="mb-2 text-sm font-semibold uppercase text-gray-500">
            {CATEGORY_LABEL[category] || category}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((b) => (
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
        </section>
      ))}
    </div>
  );
}
