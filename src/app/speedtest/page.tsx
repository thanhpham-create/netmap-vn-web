'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { runSpeedTest, type SpeedTestResult, type SpeedTestPhase } from '@/lib/speedtest';
import { getCurrentPosition, isInVietnam, type Coords } from '@/lib/geolocation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

const CARRIERS = ['Viettel', 'VNPT', 'MobiFone', 'Vietnamobile', 'FPT', 'CMC'];
const NETWORK_TYPES = ['5G', '5G-NSA', '5G-SA', '4G+', '4G', '3G', 'WIFI'];

export default function SpeedtestPage() {
  const t = useTranslations('speedtest');
  const { ensureDeviceRegistered, tokens } = useAuth();
  const [carrier, setCarrier] = useState('Viettel');
  const [carrierAutoSet, setCarrierAutoSet] = useState(false);

  // Detect carrier from IP/ASN on mount (cached server-side 24h)
  const { data: whoami } = useQuery({
    queryKey: ['measure', 'whoami'],
    queryFn: () => api.whoami(),
    staleTime: Infinity,  // browser cache for the session
  });

  // Auto-set carrier when detected (only first time, don't override user choice)
  useEffect(() => {
    if (whoami?.carrier && !carrierAutoSet) {
      // Only include carriers that exist in dropdown
      const known = CARRIERS.find((c) => c === whoami.carrier);
      if (known) {
        setCarrier(known);
        setCarrierAutoSet(true);
      }
    }
  }, [whoami, carrierAutoSet]);

  const [networkType, setNetworkType] = useState('5G');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [progress, setProgress] = useState<{ label: string; mbps?: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setError(null); setResult(null); setSubmitted(false);
    setRunning(true);
    try {
      // 1. Geo
      setProgress({ label: t('fetchingLocation') });
      const c = await getCurrentPosition();
      if (!isInVietnam(c)) {
        throw new Error(t('outOfVietnam'));
      }
      setCoords(c);

      // 2. Run test — phase keys map to localized labels
      const phaseLabels: Record<SpeedTestPhase, string> = {
        ping:     t('measuringPing'),
        download: t('measuringDownload'),
        upload:   t('measuringUpload'),
      };
      const r = await runSpeedTest((phase, mbps) =>
        setProgress({ label: phaseLabels[phase], mbps })
      );
      setResult(r);
      setProgress(null);
    } catch (err: any) {
      setError(err.message);
      setProgress(null);
    } finally {
      setRunning(false);
    }
  }

  async function submit() {
    if (!result || !coords) return;
    setError(null);
    try {
      const deviceToken = await ensureDeviceRegistered();
      await api.submitSpeedTest(
        {
          carrierName: carrier,
          networkType,
          downloadMbps: result.downloadMbps,
          uploadMbps: result.uploadMbps,
          latencyMs: result.latencyMs,
          latitude: coords.latitude,
          longitude: coords.longitude,
          locationAccuracyM: coords.accuracyM,
          testType: 'manual',
        },
        { deviceToken, ...tokens },
      );
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-sm text-gray-600">{t('subtitle')}</p>

      {/* Localhost warning — speeds via loopback are not real */}
      {(process.env.NEXT_PUBLIC_API_URL?.includes('localhost') || process.env.NEXT_PUBLIC_API_URL?.includes('127.0.0.1')) && (
        <div className="rounded-md border border-orange-300 bg-orange-50 p-3 text-xs text-orange-900">
          {t('localhostWarning')}
        </div>
      )}

      {/* Detected carrier banner */}
      {whoami && whoami.carrier && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm">
          <p className="font-semibold text-green-900">
            ✓ {t('detected', { carrier: whoami.carrier })}
          </p>
          {whoami.asName && (
            <p className="mt-0.5 text-xs text-green-700">
              {t('detectedFromAs', { asn: whoami.asn ?? '—', asName: whoami.asName })}
            </p>
          )}
        </div>
      )}

      {whoami && !whoami.carrier && whoami.confidence !== 'none' && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
          <p>{t('detectedNone')}</p>
          {whoami.asName && (
            <p className="mt-0.5 opacity-75">
              {t('detectedFromAs', { asn: whoami.asn ?? '—', asName: whoami.asName })}
            </p>
          )}
          <p className="mt-1">{t('detectedHint')}</p>
        </div>
      )}

      {/* Mismatch warning when user's selection differs from detected */}
      {whoami?.carrier && carrier !== whoami.carrier && (
        <div className="rounded-md border border-vnred-200 bg-vnred-50 p-3 text-xs text-vnred-700">
          {t('mismatchWarning', { detected: whoami.carrier, selected: carrier })}
        </div>
      )}

      {!whoami?.carrier && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
          {t('carrierHint')}
        </div>
      )}

      {/* Form */}
      <div className="space-y-3 rounded-md border bg-white p-4 shadow-sm">
        <label className="block text-sm">
          <span className="font-medium text-gray-700">{t('carrier')}</span>
          <select value={carrier} onChange={(e) => setCarrier(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2">
            {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-gray-700">{t('networkType')}</span>
          <select value={networkType} onChange={(e) => setNetworkType(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2">
            {NETWORK_TYPES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button
          onClick={start}
          disabled={running}
          className="w-full rounded-md bg-vnred-500 py-3 text-lg font-semibold text-white hover:bg-vnred-600 disabled:bg-gray-300"
        >
          {running ? t('running') : t('start')}
        </button>
      </div>

      {progress && (
        <div className="rounded-md border bg-white p-4 text-sm shadow-sm">
          <p className="text-gray-700">{progress.label}</p>
          {progress.mbps !== undefined && (
            <p className="mt-1 text-3xl font-bold tabular-nums text-vnred-600">
              {progress.mbps.toFixed(1)} <span className="text-sm font-normal text-gray-500">Mbps</span>
            </p>
          )}
        </div>
      )}

      {result && !submitted && (
        <div className="space-y-3 rounded-md border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">{t('result')}</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label={t('download')} value={result.downloadMbps} unit="Mbps" />
            <Stat label={t('upload')} value={result.uploadMbps} unit="Mbps" />
            <Stat label={t('ping')} value={result.latencyMs} unit="ms" />
          </div>
          {coords && (
            <p className="text-xs text-gray-500">
              📍 {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
              {coords.accuracyM && ` (±${coords.accuracyM}m)`}
            </p>
          )}
          <button
            onClick={submit}
            className="w-full rounded-md bg-vnred-500 py-2 font-medium text-white hover:bg-vnred-600"
          >
            {t('submit')}
          </button>
        </div>
      )}

      {submitted && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {t('submitted')}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-vnred-200 bg-vnred-50 p-3 text-sm text-vnred-700">
          {error}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded bg-gray-50 p-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-[10px] text-gray-400">{unit}</p>
    </div>
  );
}
