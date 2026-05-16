import Link from 'next/link';
import { useTranslations } from 'next-intl';
import NationalOutages from '@/components/NationalOutages';
import CoverageMap from '@/components/CoverageMapClient';

export default function HomePage() {
  const t = useTranslations('home');
  const tc = useTranslations('contributeCta');
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <section>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {t.rich('subtitle', {
            b: (chunks) => <span className="font-medium">{chunks}</span>,
          })}
        </p>
      </section>

      <NationalOutages />

      <CoverageMap />

      {/* Contribute CTA — nudge để user thực đóng góp dữ liệu */}
      <section className="rounded-xl border border-vnred-200 bg-gradient-to-br from-vnred-50 to-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
              {tc('title')}
            </h2>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
              {tc('subtitle')}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Link
              href="/speedtest"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-vnred-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-vnred-600 active:scale-95 transition"
            >
              <span aria-hidden>⚡</span> {tc('runSpeedtest')}
            </Link>
            <Link
              href="/outages"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-vnred-300 bg-white px-4 py-2.5 text-sm font-medium text-vnred-700 hover:bg-vnred-50 active:scale-95 transition"
            >
              <span aria-hidden>📡</span> {tc('reportOutage')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
