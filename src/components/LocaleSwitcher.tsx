'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { setLocale } from '@/i18n/actions';
import { LOCALES, LOCALE_LABELS, type Locale } from '@/i18n/config';

export default function LocaleSwitcher() {
  const current = useLocale() as Locale;
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Locale;
    startTransition(async () => {
      await setLocale(next);
      // Force full reload so server components rerender with new messages
      window.location.reload();
    });
  }

  return (
    <select
      value={current}
      onChange={onChange}
      disabled={pending}
      aria-label="Language"
      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {l === 'vi' ? '🇻🇳' : '🇬🇧'} {LOCALE_LABELS[l]}
        </option>
      ))}
    </select>
  );
}
