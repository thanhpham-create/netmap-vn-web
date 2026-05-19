// FAQ / Help page — trả lời câu hỏi thường gặp về speed test, carrier detection,
// data privacy. Trả lời SEO-friendly cho long-tail Google queries.

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp · NetMap VN',
  description: 'Giải đáp về speed test, phát hiện nhà mạng, độ chính xác kết quả, bảo mật dữ liệu của NetMap VN.',
  alternates: { canonical: '/help' },
};

type QA = { q: string; a: React.ReactNode };

const FAQS: { section: string; items: QA[] }[] = [
  {
    section: 'Speed test',
    items: [
      {
        q: 'Tại sao tốc độ NetMap đo thấp hơn speedtest.net?',
        a: (
          <>
            <p>
              NetMap backend đặt tại Singapore (Railway). Latency từ Việt Nam đến Singapore ~30-50ms,
              trong khi speedtest.net dùng server tại VN với latency ~5ms.
            </p>
            <p className="mt-2">
              Theo lý thuyết TCP, throughput tỉ lệ nghịch với latency. RTT cao ~6-10× → throughput
              thấp tương ứng. Nếu mạng anh thực 100 Mbps, speedtest.net đo được 80-100 Mbps,
              nhưng NetMap chỉ đo được 15-40 Mbps. Đây là hiện tượng vật lý, không phải bug.
            </p>
            <p className="mt-2">
              NetMap dùng cho <strong>so sánh tương đối</strong> giữa các vị trí / nhà mạng / thời gian
              — không phải đo bandwidth tuyệt đối. Khi cộng đồng cùng đo qua NetMap (cùng baseline Singapore),
              tỉnh nào nhà mạng nào nhanh hơn nhà mạng nào vẫn so sánh chính xác.
            </p>
          </>
        ),
      },
      {
        q: 'Tại sao tôi xài WiFi Viettel mà đo được kết quả VNPT?',
        a: (
          <>
            <p>
              Nhà mạng được xác định qua <strong>ASN của IP công khai</strong> (BGP routing table).
              Router brand không quyết định ISP — anh có thể dùng router Viettel nhưng dịch vụ
              Internet thực sự ký với VNPT (hoặc ngược lại).
            </p>
            <p className="mt-2">
              Cách verify: check hóa đơn internet anh đang trả tiền hàng tháng cho ai. Hoặc dùng tool
              độc lập như{' '}
              <a href="https://whatismyipaddress.com" target="_blank" rel="noopener noreferrer"
                className="text-vnred-600 hover:underline">whatismyipaddress.com</a>
              {' '}— sẽ cho cùng kết quả.
            </p>
            <p className="mt-2">
              Trong NetMap, khi confidence detection cao, dropdown sẽ bị <strong>khóa</strong>
              theo nhà mạng phát hiện. Muốn đo nhà mạng khác → tắt WiFi, dùng SIM cellular nhà mạng đó,
              rồi reload trang.
            </p>
          </>
        ),
      },
      {
        q: 'Test mất bao lâu? Có tốn data không?',
        a: (
          <p>
            Tổng test ~15 giây: 2s ping + 8s download + 6s upload. Tốn ~80-100 MB data tổng cộng
            (4 stream × 25MB download + 6s upload chunks). Trên 4G/5G xài data cẩn thận. Khuyến nghị
            đo qua WiFi.
          </p>
        ),
      },
    ],
  },
  {
    section: 'Bảo mật & Quyền riêng tư',
    items: [
      {
        q: 'NetMap thu thập dữ liệu gì của tôi?',
        a: (
          <>
            <p>Khi anh contribute, NetMap lưu:</p>
            <ul className="ml-5 mt-1 list-disc space-y-0.5">
              <li>Vị trí GPS (chỉ khi anh cấp quyền)</li>
              <li>Tốc độ download/upload, ping</li>
              <li>Tên nhà mạng (qua IP, không lưu plaintext IP)</li>
              <li>Loại mạng (4G/5G/WiFi)</li>
              <li>Số điện thoại (chỉ khi đăng ký, được hash bcrypt)</li>
            </ul>
            <p className="mt-2">
              Xem chi tiết tại <Link href="/privacy" className="text-vnred-600 hover:underline">Chính sách bảo mật</Link>.
              NetMap tuân thủ Nghị định 13/2023 về Bảo vệ dữ liệu cá nhân.
            </p>
          </>
        ),
      },
      {
        q: 'Có chia sẻ data cá nhân cho bên thứ ba không?',
        a: (
          <p>
            <strong>Không.</strong> Data cá nhân (số điện thoại, vị trí chi tiết) không bao giờ chia sẻ.
            Data trên bản đồ và Open Data API đã được aggregate + ẩn danh (lưới grid ~100m, không truy ngược
            được về cá nhân).
          </p>
        ),
      },
      {
        q: 'Làm sao xoá tài khoản + data?',
        a: (
          <p>
            Gửi email <a href="mailto:hello@penwin.vn" className="text-vnred-600 underline">hello@penwin.vn</a>
            {' '}với subject &quot;Xoá tài khoản&quot;. Chúng tôi xoá trong vòng 30 ngày làm việc theo Nghị định 13/2023.
          </p>
        ),
      },
    ],
  },
  {
    section: 'Dữ liệu & độ chính xác',
    items: [
      {
        q: 'Dữ liệu hiện tại có phải thực không?',
        a: (
          <p>
            Hiện tại đang chạy với <strong>dữ liệu demo</strong> để minh hoạ (banner vàng &quot;Dữ liệu demo&quot;
            sẽ hiện trên home). Khi cộng đồng đóng góp đủ data thực, demo sẽ tự ẩn. Anh có thể giúp bằng
            cách chạy 1 speed test.
          </p>
        ),
      },
      {
        q: 'Một outage cần bao nhiêu báo cáo để verified?',
        a: (
          <p>
            5+ báo cáo từ thiết bị khác nhau, trong vòng 1 giờ, trong bán kính 2km, cùng nhà mạng +
            loại sự cố. Khi đạt threshold, hệ thống auto-verify và gửi push notification cho user
            đăng ký trong bán kính 10km.
          </p>
        ),
      },
      {
        q: 'Có spam protection không?',
        a: (
          <p>
            Có. NetMap detect anomaly tự động: speed bất khả thi, latency=0, burst spam, location ngoài VN.
            Test bị flag không vào aggregate public. Admin có dashboard review flagged content.
          </p>
        ),
      },
    ],
  },
  {
    section: 'Cộng đồng',
    items: [
      {
        q: 'Làm sao đóng góp code?',
        a: (
          <p>
            NetMap open source trên GitHub. Mở Pull Request tại{' '}
            <a href="https://github.com/thanhpham-create/netmap-vn-web" target="_blank" rel="noopener noreferrer"
              className="text-vnred-600 hover:underline">netmap-vn-web</a>. Hoặc gửi ý tưởng qua{' '}
            <Link href="/roadmap" className="text-vnred-600 hover:underline">Roadmap</Link>.
          </p>
        ),
      },
      {
        q: 'Project có ai làm? Kiếm tiền thế nào?',
        a: (
          <p>
            NetMap VN là dự án phi lợi nhuận do cộng đồng đóng góp, không có nhà tài trợ thương mại,
            không quảng cáo, không bán dữ liệu. Hosting tốn ~$10-20/tháng tự chi trả. Mục tiêu: dữ liệu
            mở minh bạch về hạ tầng viễn thông Việt Nam.
          </p>
        ),
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Câu hỏi thường gặp</h1>
        <p className="mt-2 text-sm text-gray-600">
          Giải đáp về speed test, phát hiện nhà mạng, độ chính xác, bảo mật.
          Còn câu hỏi? Email{' '}
          <a href="mailto:hello@penwin.vn" className="text-vnred-600 hover:underline">hello@penwin.vn</a>.
        </p>
      </header>

      {FAQS.map((section) => (
        <section key={section.section} className="mb-8">
          <h2 className="mb-3 text-base font-semibold text-vnred-700">{section.section}</h2>
          <div className="space-y-2">
            {section.items.map((qa, i) => (
              <details
                key={i}
                className="group rounded-md border bg-white p-3 shadow-sm open:bg-amber-50/30"
              >
                <summary className="cursor-pointer list-none font-medium text-gray-800 marker:hidden">
                  <span className="mr-2 inline-block transition-transform group-open:rotate-90">▸</span>
                  {qa.q}
                </summary>
                <div className="mt-2 pl-5 text-sm leading-relaxed text-gray-700">
                  {qa.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
