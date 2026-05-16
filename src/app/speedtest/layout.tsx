// Per-route metadata. page.tsx là client component nên không export metadata được.
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đo tốc độ mạng (Speed Test)',
  description:
    'Đo tốc độ mạng di động 4G/5G/WiFi tại vị trí của bạn. Kết quả đóng góp cho bản đồ phủ sóng cộng đồng Việt Nam.',
  openGraph: { title: 'Đo tốc độ mạng · NetMap VN' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
