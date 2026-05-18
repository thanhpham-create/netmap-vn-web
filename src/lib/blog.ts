// Blog metadata. V1 — hardcoded articles inline trong dynamic route.
// Khi nội dung scale, migrate sang MDX (cài @next/mdx + remark-gfm).

export type BlogPost = {
  slug: string;
  title: string;
  description: string;        // Used for og:description + meta description
  author: string;
  publishedAt: string;        // ISO date
  readingMinutes: number;
  tags: string[];
  /** Render component path is hardcoded trong page.tsx — slug determines content. */
};

export const POSTS: BlogPost[] = [
  {
    slug: 'gioi-thieu-netmap-vn',
    title: 'NetMap VN — Vì sao chúng tôi xây dự án này',
    description: 'Câu chuyện đằng sau NetMap VN: từ trải nghiệm cá nhân mất sóng đến bản đồ phủ sóng cộng đồng.',
    author: 'Team NetMap VN',
    publishedAt: '2026-05-01',
    readingMinutes: 4,
    tags: ['gioi-thieu', 'cong-dong'],
  },
  {
    slug: 'cach-do-toc-do-mang-dung-cach',
    title: 'Cách đo tốc độ mạng đúng cách — 7 yếu tố hay bị bỏ qua',
    description: 'Vị trí cầm máy, server speed test, thời điểm test, congestion... Hướng dẫn để dữ liệu cộng đồng chính xác hơn.',
    author: 'Team NetMap VN',
    publishedAt: '2026-05-10',
    readingMinutes: 6,
    tags: ['huong-dan', 'speedtest'],
  },
];

export const POST_BY_SLUG: Record<string, BlogPost> = Object.fromEntries(
  POSTS.map((p) => [p.slug, p]),
);
