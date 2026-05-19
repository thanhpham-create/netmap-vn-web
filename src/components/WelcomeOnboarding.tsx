'use client';

// First-time user onboarding modal — 3 bước giới thiệu nhanh project.
// Auto-show lần đầu (localStorage flag), dismiss → không show lại.

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const SEEN_KEY = 'netmap-vn:welcome-seen';

export default function WelcomeOnboarding() {
  const t = useTranslations('welcome');
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem(SEEN_KEY);
    if (!seen) {
      // Delay 1s để page load xong, không annoying ngay khi vào
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function close() {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch {}
    setOpen(false);
  }

  function nextStep() {
    if (step < 2) setStep(step + 1);
    else close();
  }

  if (!open) return null;

  const steps = [
    { icon: '🗺️', titleKey: 'step1Title', descKey: 'step1Desc' },
    { icon: '⚡', titleKey: 'step2Title', descKey: 'step2Desc' },
    { icon: '🤝', titleKey: 'step3Title', descKey: 'step3Desc' },
  ];
  const current = steps[step];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-vnred-600">
            {t('appName')}
          </p>
          <button
            onClick={close}
            aria-label={t('skip')}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <span aria-hidden className="text-lg leading-none">×</span>
          </button>
        </div>

        {/* Step content */}
        <div className="flex flex-col items-center px-6 py-6 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-vnred-50 text-3xl">
            {current.icon}
          </div>
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">{t(current.titleKey)}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{t(current.descKey)}</p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 pb-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-vnred-500' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Footer buttons */}
        <div className="flex gap-2 border-t bg-gray-50 px-4 py-3">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-md border bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              ← {t('back')}
            </button>
          ) : (
            <button
              onClick={close}
              className="flex-1 rounded-md border bg-white py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              {t('skip')}
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={nextStep}
              className="flex-1 rounded-md bg-vnred-500 py-2 text-sm font-medium text-white hover:bg-vnred-600"
            >
              {t('next')} →
            </button>
          ) : (
            <Link
              href="/speedtest"
              onClick={close}
              className="flex-1 rounded-md bg-vnred-500 py-2 text-center text-sm font-medium text-white hover:bg-vnred-600"
            >
              {t('startNow')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
