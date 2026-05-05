import { useTranslations } from 'next-intl';
import NationalOutages from '@/components/NationalOutages';
import CoverageMap from '@/components/CoverageMapClient';

export default function HomePage() {
  const t = useTranslations('home');
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
    </div>
  );
}
