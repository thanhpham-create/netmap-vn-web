import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Huy hiệu (Badges)',
  description:
    'Đóng góp dữ liệu cho NetMap VN để mở khoá các huy hiệu Speed Tester, Outage Reporter, Coverage Pioneer.',
  openGraph: { title: 'Huy hiệu · NetMap VN' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
