import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import Providers from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DemoBanner from '@/components/DemoBanner';
import JsonLd from '@/components/JsonLd';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import InstallPrompt from '@/components/InstallPrompt';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://netmap.penwin.vn';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'NetMap VN — Bản đồ phủ sóng 5G Việt Nam',
    template: '%s · NetMap VN',
  },
  description:
    'Bản đồ phủ sóng & sự cố mạng di động Việt Nam, dữ liệu cộng đồng. So sánh Viettel, VNPT, MobiFone, Vietnamobile, FPT, CMC theo từng tỉnh/khu vực.',
  keywords: [
    'NetMap VN', 'bản đồ phủ sóng', 'phủ sóng 5G', 'phủ sóng 4G',
    'Viettel', 'VNPT', 'MobiFone', 'Vietnamobile', 'FPT', 'CMC',
    'speed test Việt Nam', 'mất sóng', 'báo cáo sự cố mạng',
    '5G coverage map Vietnam', 'mobile network outage',
  ],
  authors: [{ name: 'NetMap VN community' }],
  applicationName: 'NetMap VN',
  appleWebApp: {
    capable: true,
    title: 'NetMap VN',
    statusBarStyle: 'default',
  },
  openGraph: {
    type: 'website',
    siteName: 'NetMap VN',
    url: SITE_URL,
    title: 'NetMap VN — Bản đồ phủ sóng 5G Việt Nam',
    description:
      'Dữ liệu cộng đồng từ speed test và báo cáo sự cố mạng. Minh bạch, mở, miễn phí.',
    locale: 'vi_VN',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NetMap VN — Bản đồ phủ sóng 5G Việt Nam',
    description:
      'Dữ liệu cộng đồng từ speed test và báo cáo sự cố mạng.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: SITE_URL,
    languages: { 'vi-VN': SITE_URL, 'en-US': SITE_URL },
  },
  verification: {
    // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION trên Vercel env với value Google cấp.
    // Sau khi verified, có thể giữ tag hoặc remove (không bắt buộc).
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#da251d',
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <JsonLd />
      </head>
      <body>
        {/* Skip to main content — keyboard navigation accessibility win */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-vnred-700 focus:shadow-md focus:outline focus:outline-2 focus:outline-vnred-500"
        >
          {locale === 'vi' ? 'Bỏ qua tới nội dung chính' : 'Skip to main content'}
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Header />
            <DemoBanner />
            <main id="main-content">{children}</main>
            <Footer />
            <InstallPrompt />
            <ServiceWorkerRegister />
          </Providers>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
