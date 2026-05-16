import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bảng xếp hạng đóng góp',
  description:
    'Top người đóng góp dữ liệu cộng đồng cho NetMap VN. Speed test, báo cáo sự cố, verify outage — mỗi đóng góp tính điểm vào leaderboard.',
  openGraph: { title: 'Bảng xếp hạng · NetMap VN' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
