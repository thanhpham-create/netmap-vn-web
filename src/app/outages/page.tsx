'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { getCurrentPosition, isInVietnam, type Coords } from '@/lib/geolocation';
import { track } from '@/lib/analytics';

const OUTAGE_TYPE_KEYS = [
  'no_signal', 'slow', 'no_data', 'no_call', 'no_sms', 'intermittent',
] as const;
type OutageType = typeof OUTAGE_TYPE_KEYS[number];

const CARRIERS = ['Viettel', 'VNPT', 'MobiFone', 'Vietnamobile'];

export default function OutagesPage() {
  const t = useTranslations('outages');
  const { tokens, ensureDeviceRegistered } = useAuth();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [coordsErr, setCoordsErr] = useState<string | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [carrier, setCarrier] = useState('Viettel');
  const [outageType, setOutageType] = useState<OutageType>('no_signal');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  useEffect(() => {
    getCurrentPosition()
      .then((c) => {
        if (!isInVietnam(c)) {
          setCoordsErr(t('outOfVietnam'));
        } else {
          setCoords(c);
        }
      })
      .catch((err) => setCoordsErr(err.message));
  }, [t]);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['outages', 'active', coords?.latitude, coords?.longitude],
    queryFn: () => api.activeOutages({
      lat: coords!.latitude,
      lng: coords!.longitude,
      radius: 10_000,
      hours: 6,
    }),
    enabled: !!coords,
    refetchInterval: 30_000,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!coords) return;
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const deviceToken = await ensureDeviceRegistered();
      const res = await api.reportOutage(
        {
          carrierName: carrier,
          outageType,
          latitude: coords.latitude,
          longitude: coords.longitude,
          description: description || undefined,
        },
        { deviceToken, ...tokens },
      );
      setSubmitMsg(res.message);
      setDescription('');
      setShowForm(false);
      refetch();
      track('outage_reported', { carrier, outage_type: outageType });
    } catch (err: any) {
      setSubmitMsg(`Lỗi: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        {coords && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-vnred-500 px-3 py-2 text-sm font-medium text-white hover:bg-vnred-600"
          >
            {showForm ? t('cancel') : t('reportButton')}
          </button>
        )}
      </div>

      {coordsErr && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          ⚠️ {coordsErr}
        </div>
      )}

      {!coords && !coordsErr && (
        <p className="text-sm text-gray-500">{t('fetchingLocation')}</p>
      )}

      {submitMsg && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {submitMsg}
        </div>
      )}

      {/* Report form */}
      {showForm && coords && (
        <form onSubmit={submit} className="space-y-3 rounded-md border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">{t('reportFormTitle')}</h2>
          <p className="text-xs text-gray-500">
            📍 {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
          </p>
          <label className="block text-sm">
            <span className="font-medium text-gray-700">{t('carrier')}</span>
            <select value={carrier} onChange={(e) => setCarrier(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2">
              {CARRIERS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-700">{t('type')}</span>
            <select value={outageType} onChange={(e) => setOutageType(e.target.value as OutageType)}
                    className="mt-1 w-full rounded-md border px-3 py-2">
              {OUTAGE_TYPE_KEYS.map((k) => (
                <option key={k} value={k}>{t(`type_${k}`)}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-700">{t('description')}</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                      maxLength={500} rows={3}
                      placeholder={t('descriptionPlaceholder')}
                      className="mt-1 w-full rounded-md border px-3 py-2" />
          </label>
          <button
            disabled={submitting}
            className="w-full rounded-md bg-vnred-500 py-2 font-medium text-white hover:bg-vnred-600 disabled:bg-gray-300"
          >
            {submitting ? t('submitting') : t('submit')}
          </button>
        </form>
      )}

      {/* Active outages */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">{t('activeTitle')}</h2>
          {isFetching && <span className="text-xs text-gray-400">{t('updating')}</span>}
        </div>
        {data && data.outages.length === 0 && (
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {t('noOutages')}
          </div>
        )}
        <ul className="space-y-2">
          {(data?.outages || []).map((o, i) => {
            const typeKey = OUTAGE_TYPE_KEYS.includes(o.outageType as OutageType)
              ? (o.outageType as OutageType) : null;
            return (
              <li key={i} className="rounded-md border bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{o.carrierName}</span>
                  <span className="rounded bg-vnred-50 px-2 py-0.5 text-xs text-vnred-700">
                    {typeKey ? t(`type_${typeKey}`) : o.outageType}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {t('reportsAtTime', {
                    count: o.reportCount,
                    time: new Date(o.firstReported).toLocaleTimeString(),
                  })}
                </p>
                {o.affectedAreas && o.affectedAreas.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">{o.affectedAreas.join(', ')}</p>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
