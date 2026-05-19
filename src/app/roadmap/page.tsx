// Public roadmap — hiển thị tính năng đang xây / đã ưu tiên / future ideas.
// Khác changelog (đã ship) — roadmap là forward-looking.

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Roadmap · NetMap VN',
  description: 'Tính năng sắp tới và định hướng phát triển NetMap VN. Cộng đồng có thể đề xuất ý tưởng qua GitHub.',
  alternates: { canonical: '/roadmap' },
};

type Item = {
  title: string;
  description: string;
  status: 'planned' | 'in_progress' | 'considering';
  category: string;
};

const ITEMS: Item[] = [
  // In progress
  {
    title: 'Backend custom domain api.penwin.vn',
    description: 'Khi upgrade Railway Hobby plan ($5/tháng), API sẽ chuyển sang api.penwin.vn cho URL chuyên nghiệp hơn.',
    status: 'in_progress',
    category: 'Infrastructure',
  },
  {
    title: 'AI outage summary với Anthropic API key',
    description: 'Code đã sẵn sàng — chỉ cần set ANTHROPIC_API_KEY env trên Railway để activate. Generate natural-language tổng quan sự cố mạng 6h qua.',
    status: 'in_progress',
    category: 'AI',
  },

  // Planned (next quarter)
  {
    title: 'Backend migration sang VN cloud',
    description: 'VNG Cloud / FPT IDC tại Việt Nam — giảm RTT từ 30-50ms xuống ~5ms, speed test cho kết quả gần với speedtest.net hơn.',
    status: 'planned',
    category: 'Infrastructure',
  },
  {
    title: 'Email digest hàng tuần',
    description: 'Tóm tắt sự cố tuần qua ở khu vực bạn, top contributors, badges mới mở khóa. Opt-in qua Settings.',
    status: 'planned',
    category: 'Engagement',
  },
  {
    title: 'Mobile native qua Capacitor',
    description: 'Đóng gói PWA hiện tại thành app native — submit lên App Store + Play Store, giữ codebase đồng bộ.',
    status: 'planned',
    category: 'Mobile',
  },
  {
    title: 'Real-time outage feed (WebSocket)',
    description: 'Cảnh báo realtime khi có cluster outage mới gần vị trí bạn — không phải đợi push notification.',
    status: 'planned',
    category: 'Real-time',
  },

  // Considering (under exploration)
  {
    title: 'B2B API key cho doanh nghiệp',
    description: 'Cấp API key cho carrier engineers, journalists, researchers truy cập Open Data với rate limit riêng.',
    status: 'considering',
    category: 'Platform',
  },
  {
    title: 'Comments / discussion trên outage threads',
    description: 'User có thể comment trên outage report để chia sẻ thêm context, ETA fix.',
    status: 'considering',
    category: 'Community',
  },
  {
    title: 'Mở rộng sang Lào / Campuchia',
    description: 'Cùng pattern coverage map cho thị trường Đông Nam Á khác. Hiện tại VN-only.',
    status: 'considering',
    category: 'Expansion',
  },
  {
    title: 'Carrier feedback channel',
    description: 'Cách trực tiếp gửi cluster outage tới carrier customer support — họ nhận data sớm hơn.',
    status: 'considering',
    category: 'Platform',
  },
  {
    title: 'Heatmap predictive — dự đoán chất lượng',
    description: 'ML model dự đoán chất lượng mạng tại điểm chưa có data dựa trên data lân cận.',
    status: 'considering',
    category: 'AI',
  },
];

const STATUS_LABEL: Record<Item['status'], { label: string; color: string }> = {
  in_progress: { label: 'Đang làm', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  planned: { label: 'Đã lên kế hoạch', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  considering: { label: 'Đang cân nhắc', color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export default function RoadmapPage() {
  const grouped = {
    in_progress: ITEMS.filter((i) => i.status === 'in_progress'),
    planned: ITEMS.filter((i) => i.status === 'planned'),
    considering: ITEMS.filter((i) => i.status === 'considering'),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Roadmap</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tính năng sắp tới của NetMap VN. Đề xuất ý tưởng qua{' '}
          <a
            href="https://github.com/thanhpham-create/netmap-vn-web"
            target="_blank"
            rel="noopener noreferrer"
            className="text-vnred-600 hover:underline"
          >
            GitHub issue
          </a>
          . Xem{' '}
          <Link href="/changelog" className="text-vnred-600 hover:underline">
            Changelog
          </Link>{' '}
          cho tính năng đã ship.
        </p>
      </header>

      {(['in_progress', 'planned', 'considering'] as const).map((status) => {
        const items = grouped[status];
        if (items.length === 0) return null;
        const meta = STATUS_LABEL[status];
        return (
          <section key={status} className="mb-8">
            <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
              <span className={`rounded-full border px-2.5 py-0.5 text-xs ${meta.color}`}>
                {meta.label}
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">{items.length} mục</span>
            </h2>
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.title} className="rounded-md border bg-white p-3 shadow-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-medium">{it.title}</h3>
                    <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-500">
                      {it.category}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{it.description}</p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <div className="mt-8 rounded-md border bg-amber-50 p-4 text-sm">
        <p className="font-semibold text-amber-900">💡 Đề xuất tính năng mới?</p>
        <p className="mt-1 text-amber-800">
          Mở GitHub issue hoặc gửi email{' '}
          <a href="mailto:hello@penwin.vn" className="font-medium underline">
            hello@penwin.vn
          </a>
          . Chúng tôi đọc tất cả đề xuất từ cộng đồng.
        </p>
      </div>
    </div>
  );
}
