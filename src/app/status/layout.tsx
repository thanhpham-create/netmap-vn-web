import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trạng thái hệ thống',
  description: 'Trạng thái uptime của backend NetMap VN. Kiểm tra real-time mỗi 30s.',
  openGraph: { title: 'System status · NetMap VN' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
