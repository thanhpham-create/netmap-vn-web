'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
        ⚠️
      </div>
      <h1 className="text-2xl font-bold">{t('errorTitle')}</h1>
      <p className="text-sm text-gray-600">{t('errorDesc')}</p>
      {error.digest && (
        <p className="text-xs text-gray-400">{t('errorCode')}: <code className="font-mono">{error.digest}</code></p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={reset}
          className="rounded-md bg-vnred-500 px-4 py-2 text-sm font-medium text-white hover:bg-vnred-600"
        >
          {t('tryAgain')}
        </button>
        <a
          href="/"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          {t('goHome')}
        </a>
      </div>
    </div>
  );
}
