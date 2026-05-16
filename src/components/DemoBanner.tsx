'use client';

// Hiển thị banner cảnh báo "đang chạy với dữ liệu demo" để người dùng không nhầm
// lẫn số liệu seed với số liệu cộng đồng thực. Toggle qua env NEXT_PUBLIC_DEMO_MODE.
// User có thể dismiss; choice lưu vào localStorage để khỏi hiện lại trong session sau.

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const DISMISS_KEY = 'netmap-demo-banner-dismissed';

export default function DemoBanner() {
  const t = useTranslations('demoBanner');
  const [visible, setVisible] = useState(false);

  // Defer visibility check to mount to avoid SSR mismatch
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return;
    const dismissed = typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1';
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch {}
    setVisible(false);
  }

  return (
    <div
      role="status"
      className="border-y border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 sm:text-sm"
    >
      <div className="mx-auto flex max-w-6xl items-start justify-between gap-3">
        <div className="flex-1">
          <span className="font-semibold">🧪 {t('label')}</span>
          <span className="mx-1.5 opacity-50">·</span>
          <span>{t('description')}</span>{' '}
          <Link href="/speedtest" className="font-medium underline underline-offset-2 hover:text-amber-700">
            {t('cta')}
          </Link>
        </div>
        <button
          onClick={dismiss}
          aria-label={t('dismiss')}
          className="-mr-1 shrink-0 rounded p-1 leading-none hover:bg-amber-100"
        >
          <span aria-hidden>×</span>
        </button>
      </div>
    </div>
  );
}
