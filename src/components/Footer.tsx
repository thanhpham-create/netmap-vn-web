// Footer chung cho mọi page — links chân trang + bản quyền.

import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

export default async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations('footer');
  const year = new Date().getFullYear();
  const isVN = locale === 'vi';

  return (
    <footer className="mt-12 border-t bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-600 sm:py-8 sm:text-sm">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-gray-800">NetMap VN</p>
            <p className="mt-1 text-gray-500">{t('tagline')}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/about" className="hover:text-vnred-600 hover:underline">{t('about')}</Link>
            <Link href="/terms" className="hover:text-vnred-600 hover:underline">{t('terms')}</Link>
            <Link href="/privacy" className="hover:text-vnred-600 hover:underline">{t('privacy')}</Link>
            <Link href="/api/docs" className="hover:text-vnred-600 hover:underline">{t('apiDocs')}</Link>
            <a
              href="https://github.com/thanhpham-create/netmap-vn-web"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-vnred-600 hover:underline"
            >
              GitHub
            </a>
          </nav>
        </div>
        <p className="mt-4 border-t border-gray-200 pt-4 text-center text-[11px] text-gray-400">
          © {year} NetMap VN · {isVN ? 'Dự án phi lợi nhuận' : 'Non-profit project'}
        </p>
      </div>
    </footer>
  );
}
