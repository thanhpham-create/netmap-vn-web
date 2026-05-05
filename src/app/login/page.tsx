'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const RESEND_COOLDOWN = 60; // matches backend OTP_REQUEST_COOLDOWN_MS

export default function LoginPage() {
  const t = useTranslations('login');
  const router = useRouter();
  const { setUserToken, ensureDeviceRegistered, user, logout } = useAuth();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  // Countdown for resend
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const id = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendSeconds]);

  if (user) {
    return (
      <div className="mx-auto max-w-md p-6">
        <div className="rounded-md border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-700">{t('alreadyLoggedIn')}:</p>
          <p className="mt-1 text-lg font-semibold">{user.displayName || user.phone}</p>
          <p className="text-xs text-gray-500">{t('role')}: {user.role}</p>
          <button
            onClick={logout}
            className="mt-4 w-full rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            {t('logout')}
          </button>
        </div>
      </div>
    );
  }

  async function requestOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api.requestOtp(phone);
      setDevOtp(res.devOtp ?? null);
      setStep('code');
      setResendSeconds(RESEND_COOLDOWN);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api.verifyOtp(phone, code);
      setUserToken(res.token, res.user);
      await ensureDeviceRegistered();
      router.push('/leaderboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-xl font-bold">{t('title')}</h1>
      <p className="text-sm text-gray-600">{t('subtitle')}</p>

      {step === 'phone' && (
        <form onSubmit={requestOtp} className="space-y-3 rounded-md border bg-white p-4 shadow-sm">
          <label className="block text-sm">
            <span className="font-medium text-gray-700">{t('phoneLabel')}</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('phonePlaceholder')}
              required
              pattern="0\d{9,10}"
              className="mt-1 w-full rounded-md border px-3 py-2 focus:border-vnred-500 focus:outline-none"
            />
          </label>
          <button
            disabled={busy}
            className="w-full rounded-md bg-vnred-500 py-2 font-medium text-white hover:bg-vnred-600 disabled:bg-gray-300"
          >
            {busy ? t('sending') : t('sendOtp')}
          </button>
          {error && <p className="text-sm text-vnred-600">{error}</p>}
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={verify} className="space-y-3 rounded-md border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">
            {t('sentTo', { phone })}{' '}
            <button
              type="button"
              onClick={() => { setStep('phone'); setCode(''); setDevOtp(null); setResendSeconds(0); }}
              className="text-vnred-600 hover:underline"
            >
              {t('changePhone')}
            </button>
          </p>

          {devOtp && (
            <div className="rounded bg-yellow-50 p-2 text-xs text-yellow-700">
              {t('devOtpLabel')}: <code className="font-mono">{devOtp}</code> {t('devOtpHint')}
            </div>
          )}

          <label className="block text-sm">
            <span className="font-medium text-gray-700">{t('codeLabel')}</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
              className="mt-1 w-full rounded-md border px-3 py-2 text-center text-2xl tracking-widest focus:border-vnred-500 focus:outline-none"
            />
          </label>
          <button
            disabled={busy}
            className="w-full rounded-md bg-vnred-500 py-2 font-medium text-white hover:bg-vnred-600 disabled:bg-gray-300"
          >
            {busy ? t('verifying') : t('verify')}
          </button>

          {/* Resend with countdown */}
          <button
            type="button"
            onClick={() => requestOtp()}
            disabled={resendSeconds > 0 || busy}
            className="w-full text-xs text-gray-500 hover:text-vnred-600 disabled:text-gray-400 disabled:hover:text-gray-400"
          >
            {resendSeconds > 0 ? t('resendIn', { seconds: resendSeconds }) : t('resend')}
          </button>

          {error && <p className="text-sm text-vnred-600">{error}</p>}
        </form>
      )}
    </div>
  );
}
