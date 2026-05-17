// Public status page — live ping backend /health + show uptime indicator.
// Tự refresh mỗi 30s. Đơn giản, không cần persistent history.

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const POLL_INTERVAL_MS = 30_000;

type ServiceStatus = {
  name: string;
  url?: string;
  status: 'ok' | 'down' | 'checking';
  latencyMs?: number;
  details?: string;
  checkedAt?: Date;
};

export default function StatusPage() {
  const t = useTranslations('status');
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API Backend', url: `${API_URL}/health`, status: 'checking' },
    { name: 'Frontend (Vercel)', status: 'ok', details: 'You are reading this page' },
  ]);

  async function checkBackend(): Promise<ServiceStatus> {
    const start = performance.now();
    try {
      const res = await fetch(`${API_URL}/health`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
      const latencyMs = Math.round(performance.now() - start);
      if (!res.ok) {
        return {
          name: 'API Backend',
          url: `${API_URL}/health`,
          status: 'down',
          latencyMs,
          details: `HTTP ${res.status}`,
          checkedAt: new Date(),
        };
      }
      const body = await res.json();
      return {
        name: 'API Backend',
        url: `${API_URL}/health`,
        status: 'ok',
        latencyMs,
        details: body?.service ? `${body.service} · uptime ${formatUptime(body.uptime)}` : '',
        checkedAt: new Date(),
      };
    } catch (err: any) {
      return {
        name: 'API Backend',
        url: `${API_URL}/health`,
        status: 'down',
        details: err?.message?.slice(0, 80) || 'Network error',
        checkedAt: new Date(),
      };
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const result = await checkBackend();
      if (!cancelled) {
        setServices((prev) => [result, ...prev.slice(1)]);
      }
    }
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const overall = services.some((s) => s.status === 'down')
    ? 'down'
    : services.every((s) => s.status === 'ok')
    ? 'ok'
    : 'checking';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="mt-1 text-sm text-gray-600">{t('subtitle')}</p>

      <div
        className={`mt-4 rounded-lg border-2 p-4 ${
          overall === 'ok'
            ? 'border-green-300 bg-green-50'
            : overall === 'down'
            ? 'border-vnred-300 bg-vnred-50'
            : 'border-gray-300 bg-gray-50'
        }`}
      >
        <p className="text-lg font-semibold">
          {overall === 'ok'
            ? `✅ ${t('allOperational')}`
            : overall === 'down'
            ? `⚠️ ${t('issuesDetected')}`
            : `… ${t('checking')}`}
        </p>
      </div>

      <ul className="mt-6 space-y-2">
        {services.map((s, i) => (
          <li
            key={s.name}
            className="flex items-start justify-between rounded-md border bg-white p-3 shadow-sm"
          >
            <div className="flex-1">
              <p className="font-medium">
                <StatusDot status={s.status} />
                <span className="ml-2">{s.name}</span>
              </p>
              {s.details && <p className="mt-0.5 text-xs text-gray-500">{s.details}</p>}
              {s.url && (
                <p className="mt-0.5 text-[10px] text-gray-400 break-all">{s.url}</p>
              )}
            </div>
            <div className="text-right text-xs text-gray-500">
              {s.latencyMs !== undefined && (
                <p className="tabular-nums font-medium">
                  {s.latencyMs} ms
                </p>
              )}
              {s.checkedAt && (
                <p className="mt-0.5 text-[10px] text-gray-400">
                  {s.checkedAt.toLocaleTimeString('vi-VN')}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-gray-500">
        {t('autoRefresh', { seconds: POLL_INTERVAL_MS / 1000 })}
      </p>
    </div>
  );
}

function StatusDot({ status }: { status: ServiceStatus['status'] }) {
  const color =
    status === 'ok' ? 'bg-green-500' : status === 'down' ? 'bg-vnred-500' : 'bg-gray-400 animate-pulse';
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}

function formatUptime(seconds?: number): string {
  if (!seconds || seconds < 0) return '?';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
