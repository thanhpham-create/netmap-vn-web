'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'netmap-vn:install-dismissed';

export default function InstallPrompt() {
  const t = useTranslations('install');
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Don't re-prompt if user dismissed in last 7 days
    const dismissedAt = parseInt(localStorage.getItem(DISMISS_KEY) || '0');
    if (Date.now() - dismissedAt < 7 * 24 * 3600 * 1000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function install() {
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === 'dismissed') {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setVisible(false);
    setEvent(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 shadow-lg md:bottom-4 md:left-auto md:right-4 md:max-w-sm md:rounded-lg md:border">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-vnred-500 text-white">
          <span className="text-2xl font-bold">N</span>
        </div>
        <div className="flex-1 text-sm">
          <p className="font-semibold">{t('title')}</p>
          <p className="mt-0.5 text-xs text-gray-600">{t('subtitle')}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={dismiss}
          className="flex-1 rounded-md border border-gray-300 py-2 text-sm hover:bg-gray-50"
        >
          {t('later')}
        </button>
        <button
          onClick={install}
          className="flex-1 rounded-md bg-vnred-500 py-2 text-sm font-medium text-white hover:bg-vnred-600"
        >
          {t('install')}
        </button>
      </div>
    </div>
  );
}
