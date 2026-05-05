'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';

export default function NationalOutages() {
  const t = useTranslations('outageBanner');
  const { data, isLoading } = useQuery({
    queryKey: ['outages', 'national'],
    queryFn: () => api.nationalOutages(),
    refetchInterval: 60_000,
  });

  if (isLoading) return <div className="rounded-md border bg-white p-4 text-sm text-gray-500">{t('loading')}</div>;

  const summary = data?.summary || [];
  if (summary.length === 0) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-2">
          <span className="text-green-600">✓</span>
          <div>
            <h3 className="font-semibold text-green-800">{t('noIssues')}</h3>
            <p className="text-sm text-green-700">{t('stable')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-vnred-200 bg-vnred-50 p-4">
      <h3 className="mb-2 flex items-center gap-2 font-semibold text-vnred-700">
        <span>🚨</span> {t('title')}
      </h3>
      <ul className="space-y-2">
        {summary.map((s, i) => (
          <li key={i} className="rounded bg-white p-2 text-sm shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{s.carrierName}</span>
              <span className="text-xs text-gray-500">{s.outageType}</span>
            </div>
            <p className="text-xs text-gray-600">
              {t('reportCount', { count: s.reportCount, provinces: s.provincesAffected })}
            </p>
            {s.provinces && s.provinces.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">{s.provinces.slice(0, 5).join(', ')}{s.provinces.length > 5 ? '…' : ''}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
