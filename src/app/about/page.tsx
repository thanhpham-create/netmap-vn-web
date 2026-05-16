// About page — giới thiệu NetMap VN: mục đích, cách hoạt động, team.

import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Về NetMap VN',
  description: 'Bản đồ phủ sóng cộng đồng cho mạng di động Việt Nam',
};

export default async function AboutPage() {
  const locale = await getLocale();
  const isVN = locale === 'vi';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <article className="prose prose-sm sm:prose-base prose-headings:font-semibold max-w-none">
        {isVN ? <ContentVN /> : <ContentEN />}
      </article>
    </div>
  );
}

function ContentVN() {
  return (
    <>
      <h1>Về NetMap VN</h1>
      <p className="lead text-gray-600">
        Bản đồ phủ sóng và sự cố mạng di động Việt Nam, xây dựng từ dữ liệu cộng đồng tự nguyện đóng góp.
      </p>

      <h2>Mục tiêu</h2>
      <p>
        NetMap VN ra đời với mong muốn:
      </p>
      <ul>
        <li>Cho người dùng <strong>biết được thực tế chất lượng mạng</strong> tại từng khu vực, từng nhà mạng;</li>
        <li>Phát hiện <strong>sự cố mất sóng theo thời gian thực</strong> dựa trên báo cáo cộng đồng;</li>
        <li>Tạo <strong>dữ liệu mở</strong> (Open Data) để nghiên cứu, báo chí, và minh bạch hoá hạ tầng viễn thông.</li>
      </ul>

      <h2>Cách hoạt động</h2>
      <ol>
        <li>
          <strong>Speed Test</strong> — Bạn chạy đo tốc độ tại vị trí hiện tại. Kết quả (download, upload, ping)
          cùng vị trí được ẩn danh và thêm vào lưới phủ sóng (coverage grid).
        </li>
        <li>
          <strong>Báo cáo sự cố</strong> — Khi gặp mất sóng, chậm, hoặc không gọi/SMS được, bạn gửi báo cáo.
          Hệ thống tự động cluster các báo cáo gần nhau theo không gian-thời gian. Khi cluster đạt 3+ báo cáo
          khác thiết bị trong cùng khu vực, sự cố được tự động xác minh.
        </li>
        <li>
          <strong>Push notification</strong> — Đăng ký nhận thông báo khi có sự cố lớn trong bán kính 10km
          quanh vị trí của bạn.
        </li>
        <li>
          <strong>So sánh nhà mạng</strong> — Filter dữ liệu theo tỉnh + thời gian + loại mạng, so sánh khách quan
          chất lượng giữa Viettel, VNPT, MobiFone, Vietnamobile, FPT, CMC.
        </li>
      </ol>

      <h2>Công nghệ</h2>
      <ul>
        <li><strong>Frontend</strong>: Next.js 15 + React 19 + Tailwind, hosted trên Vercel (region Singapore).</li>
        <li><strong>Backend</strong>: Fastify + Node 20 + TypeScript, hosted trên Railway.</li>
        <li><strong>Database</strong>: PostgreSQL với bbox prefilter cho map query siêu nhanh (~ms).</li>
        <li><strong>Map tiles</strong>: MapLibre GL + MapTiler streets-v2 (3D buildings ở zoom street level).</li>
        <li><strong>Auth</strong>: OTP qua SMS (eSMS.vn brandname) + 2-tier JWT (user/device token).</li>
        <li><strong>PWA</strong>: Service worker (cache-first + SWR), offline page, push notification.</li>
      </ul>

      <h2>Open Source</h2>
      <p>
        Toàn bộ source code công khai trên GitHub. Bạn có thể:
      </p>
      <ul>
        <li>Đọc code và đề xuất cải tiến qua Pull Request;</li>
        <li>Tải Open Data về phân tích;</li>
        <li>Tự host bản nội bộ.</li>
      </ul>
      <p>
        <a href="https://github.com/thanhpham-create/netmap-vn-web" target="_blank" rel="noopener noreferrer"
           className="text-vnred-600 hover:underline">
          → Frontend (netmap-vn-web)
        </a>
      </p>

      <h2>Cộng đồng</h2>
      <p>
        NetMap VN là dự án phi lợi nhuận, không có nhà tài trợ thương mại. Mọi đóng góp từ người dùng đều
        được công khai (anonymized) trên bản đồ và Leaderboard.
      </p>

      <h2>Liên hệ &amp; góp ý</h2>
      <p>
        Email: <a href="mailto:hello@penwin.vn" className="text-vnred-600 underline">hello@penwin.vn</a>
      </p>
      <p>
        Hoặc mở issue/PR trên GitHub.
      </p>

      <hr />

      <p>
        <Link href="/speedtest" className="font-medium text-vnred-600 hover:underline">
          → Đóng góp speed test đầu tiên
        </Link>
      </p>
    </>
  );
}

function ContentEN() {
  return (
    <>
      <h1>About NetMap VN</h1>
      <p className="lead text-gray-600">
        A community-driven coverage and outage map for Vietnamese mobile carriers, built on voluntary
        crowdsourced data.
      </p>

      <h2>Mission</h2>
      <ul>
        <li>Help users <strong>see real network quality</strong> in every area for every carrier;</li>
        <li>Detect <strong>outages in real-time</strong> via community reports;</li>
        <li>Create <strong>Open Data</strong> for research, journalism, and infrastructure transparency.</li>
      </ul>

      <h2>How it works</h2>
      <ol>
        <li>
          <strong>Speed Test</strong> — You run a speed test at your current location. Results (download,
          upload, ping) and location are anonymized and added to the coverage grid.
        </li>
        <li>
          <strong>Outage reports</strong> — When you experience no signal, slow data, or can&apos;t call/SMS,
          you submit a report. The system clusters reports by space-time. Once a cluster has 3+ reports from
          different devices in the same area, the outage is automatically verified.
        </li>
        <li>
          <strong>Push notifications</strong> — Opt in to receive alerts for major outages within 10km of you.
        </li>
        <li>
          <strong>Carrier comparison</strong> — Filter data by province, time, and network type to objectively
          compare Viettel, VNPT, MobiFone, Vietnamobile, FPT, CMC.
        </li>
      </ol>

      <h2>Tech stack</h2>
      <ul>
        <li><strong>Frontend</strong>: Next.js 15 + React 19 + Tailwind, hosted on Vercel (Singapore region).</li>
        <li><strong>Backend</strong>: Fastify + Node 20 + TypeScript, hosted on Railway.</li>
        <li><strong>Database</strong>: PostgreSQL with bbox prefilter for sub-ms map queries.</li>
        <li><strong>Map tiles</strong>: MapLibre GL + MapTiler streets-v2 (3D buildings at street zoom).</li>
        <li><strong>Auth</strong>: OTP via SMS (eSMS.vn brandname) + 2-tier JWT (user/device).</li>
        <li><strong>PWA</strong>: Service worker (cache-first + SWR), offline page, push notifications.</li>
      </ul>

      <h2>Open Source</h2>
      <p>
        All source code is publicly available on GitHub. You can:
      </p>
      <ul>
        <li>Read the code and suggest improvements via Pull Request;</li>
        <li>Download Open Data for analysis;</li>
        <li>Self-host a private instance.</li>
      </ul>
      <p>
        <a href="https://github.com/thanhpham-create/netmap-vn-web" target="_blank" rel="noopener noreferrer"
           className="text-vnred-600 hover:underline">
          → Frontend (netmap-vn-web)
        </a>
      </p>

      <h2>Community</h2>
      <p>
        NetMap VN is a non-profit project with no commercial sponsors. All contributions are public (anonymized)
        on the map and Leaderboard.
      </p>

      <h2>Contact &amp; feedback</h2>
      <p>
        Email: <a href="mailto:hello@penwin.vn" className="text-vnred-600 underline">hello@penwin.vn</a>
      </p>
      <p>Or open an issue/PR on GitHub.</p>

      <hr />

      <p>
        <Link href="/speedtest" className="font-medium text-vnred-600 hover:underline">
          → Contribute your first speed test
        </Link>
      </p>
    </>
  );
}
