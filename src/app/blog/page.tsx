// Blog index — list articles sắp xếp theo publishedAt desc.
// SEO: increases content surface area for long-tail search queries.

import type { Metadata } from 'next';
import Link from 'next/link';
import { POSTS } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog · NetMap VN',
  description: 'Bài viết về phủ sóng 5G, chất lượng mạng di động, hướng dẫn speed test — Cộng đồng NetMap VN.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  const posts = [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Blog NetMap VN</h1>
        <p className="mt-2 text-sm text-gray-600">
          Bài viết về mạng di động Việt Nam, hướng dẫn, phân tích dữ liệu cộng đồng.
        </p>
      </header>

      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="group block rounded-lg border bg-white p-4 shadow-sm transition hover:border-vnred-300 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-vnred-700 sm:text-xl">
                {p.title}
              </h2>
              <p className="mt-1 text-sm text-gray-600">{p.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                <span>{p.author}</span>
                <span>·</span>
                <time dateTime={p.publishedAt}>
                  {new Date(p.publishedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                  })}
                </time>
                <span>·</span>
                <span>{p.readingMinutes} phút đọc</span>
                {p.tags.length > 0 && (
                  <>
                    <span>·</span>
                    <span>{p.tags.map((t) => `#${t}`).join(' ')}</span>
                  </>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
