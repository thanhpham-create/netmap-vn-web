'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { track } from '@/lib/analytics';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'netmap-vn:install-dismissed';
const IOS_DISMISS_KEY = 'netmap-vn:ios-install-dismissed';

function detectIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  // Real Safari (not Chrome iOS, Firefox iOS, Edge iOS — those won't allow A2HS reliably anyway)
  const isSafari = !/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/.test(ua);
  return isIOS && isSafari;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari standalone detection
    (window.navigator as any).standalone === true
  );
}

export default function InstallPrompt() {
  const t = useTranslations('install');
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);

  // Android/Desktop Chromium flow: native beforeinstallprompt
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isStandalone()) return; // Already installed — don't prompt

    // iOS Safari flow — show custom A2HS instructions instead
    if (detectIOSSafari()) {
      const dismissedAt = parseInt(localStorage.getItem(IOS_DISMISS_KEY) || '0');
      if (Date.now() - dismissedAt < 14 * 24 * 3600 * 1000) return;
      // Delay slightly to avoid annoying users immediately on page load
      const timer = setTimeout(() => {
        setIosMode(true);
        setVisible(true);
        track('install_prompt_shown', { platform: 'ios' });
      }, 5000);
      return () => clearTimeout(timer);
    }

    // Android/desktop: wait for beforeinstallprompt
    const dismissedAt = parseInt(localStorage.getItem(DISMISS_KEY) || '0');
    if (Date.now() - dismissedAt < 7 * 24 * 3600 * 1000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
      track('install_prompt_shown', { platform: 'android' });
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
    } else {
      track('install_prompt_accepted', { platform: 'android' });
    }
    setVisible(false);
    setEvent(null);
  }

  function dismiss() {
    const key = iosMode ? IOS_DISMISS_KEY : DISMISS_KEY;
    localStorage.setItem(key, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;

  if (iosMode) {
    return (
      <div className="fixed inset-x-2 bottom-2 z-40 rounded-xl border bg-white p-4 shadow-xl pb-[max(1rem,env(safe-area-inset-bottom))] md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-vnred-500 text-white">
            <span className="text-2xl font-bold">N</span>
          </div>
          <div className="flex-1 text-sm">
            <p className="font-semibold">{t('iosTitle')}</p>
            <p className="mt-0.5 text-xs text-gray-600">{t('iosSubtitle')}</p>
          </div>
          <button
            onClick={dismiss}
            aria-label={t('dismiss')}
            className="-mr-1 -mt-1 shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <span aria-hidden className="text-lg leading-none">×</span>
          </button>
        </div>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-gray-700">
          <li>
            {t.rich('iosStep1', {
              icon: () => (
                <span
                  aria-hidden
                  className="mx-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-blue-50 align-middle text-blue-600"
                >
                  ↑
                </span>
              ),
            })}
          </li>
          <li>{t('iosStep2')}</li>
          <li>{t('iosStep3')}</li>
        </ol>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-2 bottom-2 z-40 rounded-xl border bg-white p-3 shadow-xl pb-[max(0.75rem,env(safe-area-inset-bottom))] md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
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
