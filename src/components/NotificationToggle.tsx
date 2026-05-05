'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';
import {
  isPushSupported, subscribePush, unsubscribePush, getCurrentSubscription,
} from '@/lib/push-client';
import { getCurrentPosition } from '@/lib/geolocation';

export default function NotificationToggle() {
  const t = useTranslations('notifications');
  const { tokens, user } = useAuth();
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported(isPushSupported());
    getCurrentSubscription().then((s) => setSubscribed(!!s));
  }, []);

  if (!user) return null;
  if (!supported) {
    return <p className="text-xs text-gray-500">{t('notSupported')}</p>;
  }

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      if (subscribed) {
        await unsubscribePush(tokens);
        setSubscribed(false);
      } else {
        let coords: { latitude: number; longitude: number } | undefined;
        try { coords = await getCurrentPosition(5000); } catch { /* ignore */ }
        await subscribePush(tokens, { ...coords, radiusM: 10000 });
        setSubscribed(true);
      }
    } catch (err: any) {
      setError(err.message === 'You need to allow notifications.' ? t('permissionDenied') : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">
          <p className="font-medium text-gray-900">{t('title')}</p>
          <p className="text-xs text-gray-500">{t('subtitle')}</p>
        </div>
        <button
          onClick={toggle}
          disabled={busy}
          aria-pressed={subscribed}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            subscribed ? 'bg-vnred-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              subscribed ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-vnred-600">{error}</p>}
    </div>
  );
}
