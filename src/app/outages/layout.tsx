import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sự cố mạng di động',
  description:
    'Xem và báo cáo sự cố mạng di động tại Việt Nam theo thời gian thực. Mất sóng, chậm, không gọi/SMS được — báo cáo cộng đồng để cảnh báo nhau.',
  openGraph: { title: 'Sự cố mạng · NetMap VN' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
