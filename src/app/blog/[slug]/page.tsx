// Blog post — `/blog/<slug>`.
// V1: nội dung hardcoded inline per-slug. Khi nhiều bài hơn → migrate sang MDX.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { POSTS, POST_BY_SLUG, type BlogPost } from '@/lib/blog';
import ShareButtons from '@/components/ShareButtons';

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = POST_BY_SLUG[slug];
  if (!p) return { title: 'Bài viết không tồn tại' };
  return {
    title: p.title,
    description: p.description,
    openGraph: {
      type: 'article',
      title: p.title,
      description: p.description,
      publishedTime: p.publishedAt,
      authors: [p.author],
      tags: p.tags,
    },
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POST_BY_SLUG[slug];
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-xs text-gray-500">
        <Link href="/" className="hover:text-vnred-600 hover:underline">Trang chủ</Link>
        <span className="mx-1.5">/</span>
        <Link href="/blog" className="hover:text-vnred-600 hover:underline">Blog</Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">{post.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>{post.author}</span>
          <span>·</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('vi-VN', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          </time>
          <span>·</span>
          <span>{post.readingMinutes} phút đọc</span>
        </div>
      </header>

      <article className="prose prose-sm sm:prose-base max-w-none">
        <ArticleContent post={post} />
      </article>

      {/* Share */}
      <section className="mt-8 border-t pt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Chia sẻ bài viết
        </p>
        <ShareButtons title={post.title} />
      </section>

      {/* Related posts */}
      <section className="mt-8 border-t pt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Bài viết khác
        </h2>
        <ul className="space-y-2">
          {POSTS.filter((p) => p.slug !== post.slug).map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="block rounded-md border bg-white p-3 text-sm hover:border-vnred-300 hover:bg-vnred-50"
              >
                <p className="font-medium">{p.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{p.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ArticleContent({ post }: { post: BlogPost }) {
  switch (post.slug) {
    case 'gioi-thieu-netmap-vn':
      return <IntroArticle />;
    case 'cach-do-toc-do-mang-dung-cach':
      return <SpeedtestGuideArticle />;
    default:
      return <p>Nội dung đang cập nhật…</p>;
  }
}

function IntroArticle() {
  return (
    <>
      <p>
        NetMap VN sinh ra từ một trải nghiệm rất quen thuộc với người dùng Việt:
        đang ngồi cà phê, gọi xe công nghệ thì điện thoại báo &quot;no signal&quot;.
        Nhà mạng quảng cáo 5G phủ kín đô thị, mà thực tế ngay quận trung tâm vẫn rớt sóng.
      </p>
      <p>
        Vấn đề: không có nguồn dữ liệu công khai, minh bạch về <strong>chất lượng mạng thực tế</strong>.
        Mỗi nhà mạng tự công bố phủ sóng &quot;trên bản đồ&quot; nhưng không ai verify được.
      </p>

      <h2>Giải pháp: dữ liệu cộng đồng</h2>
      <p>
        NetMap VN làm theo mô hình OpenStreetMap nhưng cho mạng di động. Mỗi user chạy 1 speed test
        hoặc báo cáo sự cố → dữ liệu tổng hợp ẩn danh → bản đồ phủ sóng cộng đồng.
      </p>
      <ul>
        <li><strong>Bản đồ</strong> hiển thị tốc độ mạng theo từng grid cell ~100m.</li>
        <li><strong>Phát hiện sự cố</strong> tự động khi 5+ người báo cáo trong 2km/1h cùng một nhà mạng.</li>
        <li><strong>So sánh nhà mạng</strong> theo tỉnh, thời gian, loại mạng (4G/5G).</li>
        <li><strong>Open Data</strong> CSV/JSON cho nghiên cứu, báo chí, học thuật.</li>
      </ul>

      <h2>Không quảng cáo, không bán dữ liệu</h2>
      <p>
        NetMap VN là dự án phi lợi nhuận. Code open source, dữ liệu mở. Mục tiêu duy nhất:
        cộng đồng có thông tin minh bạch về hạ tầng viễn thông Việt Nam.
      </p>

      <h2>Bạn có thể tham gia thế nào?</h2>
      <ol>
        <li>Cài app (Add to Home Screen) → chạy 1 speed test khi rảnh.</li>
        <li>Báo cáo khi gặp sự cố — 3 báo cáo gần nhau là verified.</li>
        <li>Mở Pull Request trên GitHub nếu là dev.</li>
        <li>Chia sẻ trang này với bạn bè.</li>
      </ol>

      <p>
        Cảm ơn bạn đã đến đây. Mỗi đóng góp dù nhỏ cũng giúp bản đồ chính xác hơn cho mọi người.
      </p>
    </>
  );
}

function SpeedtestGuideArticle() {
  return (
    <>
      <p>
        Speed test trông đơn giản: bấm Start, đợi 15s, ra con số. Nhưng để con số đó <em>thực sự đại diện</em> cho
        chất lượng mạng tại địa điểm đo, có 7 yếu tố bạn cần biết.
      </p>

      <h2>1. Vị trí cầm máy</h2>
      <p>
        Sóng di động bị chặn bởi cơ thể người, kính cường lực, tường bê tông cốt thép.
        Test ở giữa phòng vs cạnh cửa sổ có thể chênh 3-5×. Tốt nhất: cầm máy ngang ngực, không bịt tay.
      </p>

      <h2>2. Đông người (congestion)</h2>
      <p>
        Cell tower share băng thông giữa tất cả user trong khu vực. 7h sáng giờ đi làm tốc độ có thể chỉ
        bằng 20% tốc độ peak buổi 2h sáng. Test nhiều lần ở nhiều khung giờ mới ra số liệu thực.
      </p>

      <h2>3. Server speed test</h2>
      <p>
        NetMap VN dùng backend đặt ở Singapore (Railway). Latency ping ~30-50ms tại VN.
        Nếu test trên tool nước ngoài (Ookla, fast.com) đặt server xa hơn → latency cao hơn, không phản ánh
        chất lượng mạng nội địa.
      </p>

      <h2>4. WiFi vs cellular</h2>
      <p>
        Nếu wifi đang bật, kết quả là WiFi chứ không phải 4G/5G. Tắt wifi trước khi đo cellular.
        NetMap auto-detect qua <code>navigator.connection.type</code> nhưng iOS Safari không hỗ trợ —
        cần chọn thủ công.
      </p>

      <h2>5. Background apps</h2>
      <p>
        YouTube đang chạy nền tải video → speed test thấy đường truyền &quot;chia 2&quot;. Đóng các app
        streaming trước khi test, đặc biệt iCloud Photos sync, Google Drive backup.
      </p>

      <h2>6. Mạng đang roaming</h2>
      <p>
        Nếu bạn ở vùng giáp ranh tỉnh, máy có thể bắt sóng cell tower của tỉnh khác. Speedtest đo đúng nhà mạng
        nhưng location không match thực tế. Geocoding của NetMap dùng vị trí GPS chứ không phải cell ID
        nên ít bị nhầm.
      </p>

      <h2>7. Lặp lại nhiều lần</h2>
      <p>
        1 lần đo không đủ kết luận. Tốc độ wireless biến động lớn theo thời điểm. Test ít nhất 3-5 lần
        rải ra trong 1-2 ngày, NetMap sẽ tổng hợp trung bình per grid cell.
      </p>

      <h2>Tổng kết</h2>
      <p>
        Speed test chính xác = vị trí ổn định + thời điểm đại diện + tắt wifi/background + test nhiều lần.
        Đó cũng là lý do NetMap cần cộng đồng đóng góp — không một thiết bị nào có thể đo đại diện cho cả tỉnh.
      </p>
      <p>
        <Link href="/speedtest">→ Chạy speed test ngay tại vị trí của bạn</Link>
      </p>
    </>
  );
}
