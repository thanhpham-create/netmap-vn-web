'use client';

// AI-generated natural language summary của tình hình outage 6h qua.
// Backend cache 15 phút, frontend cache 5 phút (TanStack staleTime).
// Hide section if no API key on backend (enabled: false) hoặc không có outage.

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';

export default function AiOutageSummary() {
  const t = useTranslations('aiSummary');

  const { data, isLoading } = useQuery({
    queryKey: ['ai-outage-summary'],
    queryFn: () => api.aiOutageSummary(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Hide khi:
  // - Đang load (avoid layout shift)
  // - Backend chưa có API key (enabled: false)
  // - Không có summary (no outages, hoặc lỗi AI silently fall back to null)
  if (isLoading) return null;
  if (!data?.enabled) return null;
  if (!data?.summary) return null;

  return (
    <section className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2">
        <span aria-hidden className="text-lg">🤖</span>
        <h2 className="text-sm font-semibold text-purple-900 sm:text-base">{t('title')}</h2>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-purple-400">
          {t('aiBadge')}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-gray-700 sm:text-[15px]">{data.summary}</p>
      <p className="mt-2 text-[11px] text-gray-400">
        {t('footer', { count: data.outageCount })}
      </p>
    </section>
  );
}
