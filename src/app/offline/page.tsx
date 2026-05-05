'use client';

import { useTranslations } from 'next-intl';

export default function OfflinePage() {
  const t = useTranslations('errors');
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
        📡
      </div>
      <h1 className="text-xl font-bold">{t('offlineTitle')}</h1>
      <p className="text-sm text-gray-600">{t('offlineDesc')}</p>
      <p className="mt-2 text-xs text-gray-500">{t('offlineCachedHint')}</p>
      <button
        onClick={() => location.reload()}
        className="mt-4 rounded-md bg-vnred-500 px-4 py-2 text-sm font-medium text-white hover:bg-vnred-600"
      >
        {t('tryAgain')}
      </button>
    </div>
  );
}
