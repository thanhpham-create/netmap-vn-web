'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('errors');
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
        🗺️
      </div>
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-lg font-semibold">{t('notFoundTitle')}</p>
      <p className="text-sm text-gray-600">{t('notFoundDesc')}</p>
      <Link
        href="/"
        className="mt-3 rounded-md bg-vnred-500 px-4 py-2 text-sm font-medium text-white hover:bg-vnred-600"
      >
        {t('goHome')}
      </Link>
    </div>
  );
}
