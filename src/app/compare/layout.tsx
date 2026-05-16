import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'So sánh nhà mạng Viettel · VNPT · MobiFone',
  description:
    'So sánh khách quan chất lượng mạng Viettel, VNPT, MobiFone, Vietnamobile, FPT, CMC theo tỉnh và thời gian. Dữ liệu cộng đồng từ speed test thực tế.',
  openGraph: { title: 'So sánh nhà mạng · NetMap VN' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
