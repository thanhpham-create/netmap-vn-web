import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import Providers from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DemoBanner from '@/components/DemoBanner';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import InstallPrompt from '@/components/InstallPrompt';

export const metadata: Metadata = {
  title: 'NetMap VN — Bản đồ phủ sóng 5G Việt Nam',
  description: 'Bản đồ phủ sóng & sự cố mạng di động Việt Nam, dữ liệu cộng đồng',
  applicationName: 'NetMap VN',
  appleWebApp: {
    capable: true,
    title: 'NetMap VN',
    statusBarStyle: 'default',
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
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Header />
            <DemoBanner />
            <main>{children}</main>
            <Footer />
            <InstallPrompt />
            <ServiceWorkerRegister />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
