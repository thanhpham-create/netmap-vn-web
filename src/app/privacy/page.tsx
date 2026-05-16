// Chính sách bảo mật / Privacy Policy.
// Cover Nghị định 13/2023 về Bảo vệ dữ liệu cá nhân, Luật An ninh mạng,
// Luật Viễn thông VN. Khi launch quy mô lớn nên có DPO + tư vấn luật sư.

import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật · NetMap VN',
  description: 'Cam kết bảo vệ dữ liệu cá nhân của bạn',
};

const EFFECTIVE_DATE = '14 tháng 5, 2026';
const CONTACT_EMAIL = 'hello@penwin.vn';

export default async function PrivacyPage() {
  const locale = await getLocale();
  const isVN = locale === 'vi';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <article className="prose prose-sm sm:prose-base prose-headings:font-semibold prose-h2:mt-8 prose-h2:mb-3 max-w-none">
        {isVN ? <ContentVN /> : <ContentEN />}
        <hr className="my-8" />
        <p className="text-xs text-gray-500">
          {isVN ? 'Có hiệu lực từ' : 'Effective from'}: {EFFECTIVE_DATE}
        </p>
        <p className="text-xs">
          <Link href="/terms" className="text-vnred-600 hover:underline">
            {isVN ? '← Điều khoản sử dụng' : '← Terms of Service'}
          </Link>
        </p>
      </article>
    </div>
  );
}

function ContentVN() {
  return (
    <>
      <h1>Chính sách bảo mật</h1>
      <p className="lead text-gray-600">
        NetMap VN cam kết bảo vệ dữ liệu cá nhân của bạn theo Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân
        và pháp luật Việt Nam hiện hành.
      </p>

      <h2>1. Dữ liệu chúng tôi thu thập</h2>
      <p>NetMap VN có thể thu thập các loại dữ liệu sau:</p>
      <ul>
        <li>
          <strong>Vị trí địa lý</strong> (latitude/longitude) — CHỈ khi bạn cấp quyền và đang chạy speed test
          hoặc báo cáo sự cố. Dùng để định vị điểm đo trên bản đồ.
        </li>
        <li>
          <strong>Số điện thoại</strong> — Tuỳ chọn, chỉ khi bạn đăng ký tài khoản. Số được hash bằng bcrypt
          trước khi lưu, không lưu plaintext.
        </li>
        <li>
          <strong>Thông tin thiết bị</strong> — User-Agent, platform, device fingerprint ẩn danh để chống lạm dụng.
        </li>
        <li>
          <strong>Dữ liệu mạng</strong> — Tốc độ download/upload, ping, loại mạng (4G/5G/WiFi), nhà mạng,
          IP và ASN (chỉ để định danh nhà mạng, không lưu plaintext IP cá nhân).
        </li>
        <li>
          <strong>Báo cáo sự cố</strong> — Mô tả tự nguyện bạn nhập khi báo outage.
        </li>
      </ul>

      <h2>2. Mục đích sử dụng</h2>
      <ul>
        <li>Tổng hợp thành bản đồ phủ sóng và sự cố mạng cộng đồng;</li>
        <li>Cải thiện chất lượng và độ chính xác của dữ liệu;</li>
        <li>Xác thực người dùng và chống lạm dụng;</li>
        <li>Gửi thông báo về sự cố mạng tại khu vực của bạn (nếu bạn đăng ký).</li>
      </ul>

      <h2>3. Chia sẻ dữ liệu</h2>
      <p>
        Chúng tôi KHÔNG bán dữ liệu cá nhân của bạn cho bên thứ ba. Dữ liệu chỉ được chia sẻ trong các trường hợp:
      </p>
      <ul>
        <li>Hiển thị dưới dạng <strong>tổng hợp ẩn danh</strong> trên bản đồ công khai (không thể truy ngược về cá nhân);</li>
        <li>Cung cấp Open Data API ở dạng đã ẩn danh để cộng đồng nghiên cứu, báo chí, học thuật;</li>
        <li>Theo yêu cầu hợp pháp từ cơ quan có thẩm quyền tại Việt Nam.</li>
      </ul>

      <h2>4. Lưu trữ dữ liệu</h2>
      <p>
        Dữ liệu được lưu trên server đặt tại khu vực Đông Nam Á (Singapore). Theo Nghị định 53/2022 về Luật An ninh
        mạng, chúng tôi cam kết lưu trữ bản sao dữ liệu người dùng Việt Nam tại Việt Nam khi quy mô đạt ngưỡng yêu cầu.
      </p>
      <ul>
        <li>Speed test data & outage reports: lưu vĩnh viễn dưới dạng ẩn danh (xoá thông tin cá nhân định danh sau 12 tháng).</li>
        <li>Phone number (hashed): xoá khi tài khoản bị xoá.</li>
        <li>OTP code: tự huỷ sau 5 phút.</li>
        <li>Session token: hết hạn sau 30 ngày (user) / 90 ngày (device).</li>
      </ul>

      <h2>5. Quyền của bạn</h2>
      <p>Theo Nghị định 13/2023, bạn có các quyền sau với dữ liệu cá nhân của mình:</p>
      <ul>
        <li><strong>Quyền truy cập</strong> — yêu cầu xem dữ liệu chúng tôi đang lưu về bạn;</li>
        <li><strong>Quyền chỉnh sửa</strong> — yêu cầu sửa dữ liệu không chính xác;</li>
        <li><strong>Quyền xoá</strong> — yêu cầu xoá tài khoản và dữ liệu cá nhân;</li>
        <li><strong>Quyền hạn chế xử lý</strong> — yêu cầu tạm dừng xử lý dữ liệu;</li>
        <li><strong>Quyền phản đối</strong> — phản đối việc xử lý dữ liệu cho mục đích cụ thể;</li>
        <li><strong>Quyền khiếu nại</strong> — gửi khiếu nại đến cơ quan có thẩm quyền (Cục An toàn thông tin - Bộ TT&TT).</li>
      </ul>
      <p>
        Để thực hiện các quyền trên, gửi yêu cầu đến{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-vnred-600 underline">{CONTACT_EMAIL}</a>.
        Chúng tôi sẽ phản hồi trong vòng 30 ngày làm việc.
      </p>

      <h2>6. Bảo mật</h2>
      <ul>
        <li>Tất cả kết nối qua HTTPS với HSTS preload.</li>
        <li>Mật khẩu và OTP hash bằng bcrypt (cost factor 12).</li>
        <li>JWT signing dùng HMAC-SHA256 với secret 512-bit.</li>
        <li>Rate limit per-user/IP để chống abuse.</li>
        <li>Error tracking qua Sentry với mask all PII.</li>
      </ul>

      <h2>7. Cookie và tracking</h2>
      <p>
        NetMap VN sử dụng cookie tối thiểu cho mục đích kỹ thuật (giữ phiên đăng nhập, lưu ngôn ngữ).
        Chúng tôi KHÔNG dùng cookie quảng cáo của bên thứ ba.
      </p>

      <h2>8. Trẻ em</h2>
      <p>
        Dịch vụ không hướng tới trẻ em dưới 16 tuổi. Nếu bạn dưới 16 tuổi, vui lòng không gửi dữ liệu cá nhân.
      </p>

      <h2>9. Thay đổi chính sách</h2>
      <p>
        Khi có thay đổi quan trọng, chúng tôi sẽ thông báo qua banner trên website và (nếu có) email
        đến người dùng đã đăng ký.
      </p>

      <h2>10. Liên hệ</h2>
      <p>
        Người phụ trách dữ liệu cá nhân (Data Protection Contact):
      </p>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-vnred-600 underline">{CONTACT_EMAIL}</a>
      </p>
    </>
  );
}

function ContentEN() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="lead text-gray-600">
        NetMap VN is committed to protecting your personal data per Vietnam&apos;s Decree 13/2023/NĐ-CP on
        Personal Data Protection and applicable laws.
      </p>

      <h2>1. Data we collect</h2>
      <ul>
        <li>
          <strong>Geolocation</strong> (latitude/longitude) — ONLY when you grant permission and run a
          speed test or report an outage. Used to plot measurement points on the map.
        </li>
        <li>
          <strong>Phone number</strong> — Optional, only if you register an account. Hashed with bcrypt
          before storage, never stored in plaintext.
        </li>
        <li>
          <strong>Device info</strong> — User-Agent, platform, anonymized device fingerprint for abuse prevention.
        </li>
        <li>
          <strong>Network data</strong> — Download/upload speed, ping, network type (4G/5G/WiFi), carrier,
          IP and ASN (used only to identify carrier, not to track individuals).
        </li>
        <li>
          <strong>Outage reports</strong> — Voluntary descriptions you submit.
        </li>
      </ul>

      <h2>2. How we use data</h2>
      <ul>
        <li>Aggregate into the community coverage and outage map;</li>
        <li>Improve data quality and accuracy;</li>
        <li>Authenticate users and prevent abuse;</li>
        <li>Send notifications about network outages near you (if you opt in).</li>
      </ul>

      <h2>3. Data sharing</h2>
      <p>We do NOT sell your personal data. Sharing only happens:</p>
      <ul>
        <li>As <strong>aggregated anonymous data</strong> on the public map (not traceable to individuals);</li>
        <li>Through our Open Data API in anonymized form for research, journalism, academia;</li>
        <li>When legally required by Vietnamese authorities.</li>
      </ul>

      <h2>4. Data retention</h2>
      <p>
        Data is stored on servers in Southeast Asia (Singapore). Per Vietnam&apos;s Cybersecurity Law (Decree 53/2022),
        we will mirror Vietnamese user data within Vietnam once scale thresholds are met.
      </p>
      <ul>
        <li>Speed test & outage data: retained indefinitely in anonymized form (PII removed after 12 months).</li>
        <li>Phone (hashed): deleted when account is deleted.</li>
        <li>OTP codes: self-destruct after 5 minutes.</li>
        <li>Session tokens: expire after 30 days (user) / 90 days (device).</li>
      </ul>

      <h2>5. Your rights</h2>
      <p>Per Decree 13/2023, you have the following rights over your personal data:</p>
      <ul>
        <li><strong>Access</strong> — request a copy of data we hold about you;</li>
        <li><strong>Rectification</strong> — request correction of inaccurate data;</li>
        <li><strong>Deletion</strong> — request account and personal data deletion;</li>
        <li><strong>Restriction</strong> — request temporary suspension of processing;</li>
        <li><strong>Objection</strong> — object to specific processing purposes;</li>
        <li><strong>Complaint</strong> — file a complaint with the Authority of Information Security (Ministry of Information and Communications).</li>
      </ul>
      <p>
        To exercise these rights, email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-vnred-600 underline">{CONTACT_EMAIL}</a>.
        We will respond within 30 business days.
      </p>

      <h2>6. Security</h2>
      <ul>
        <li>All connections over HTTPS with HSTS preload.</li>
        <li>Passwords and OTP hashed with bcrypt (cost factor 12).</li>
        <li>JWT signing with HMAC-SHA256 and 512-bit secret.</li>
        <li>Per-user/IP rate limiting for abuse prevention.</li>
        <li>Error tracking via Sentry with PII masking.</li>
      </ul>

      <h2>7. Cookies and tracking</h2>
      <p>
        NetMap VN uses minimal cookies for technical purposes only (session, language). We do NOT use
        third-party advertising cookies.
      </p>

      <h2>8. Children</h2>
      <p>
        The service is not directed at children under 16. If you are under 16, please do not submit
        personal data.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        For material changes, we will notify via a banner on the site and (if applicable) email to
        registered users.
      </p>

      <h2>10. Contact</h2>
      <p>Data Protection Contact:</p>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-vnred-600 underline">{CONTACT_EMAIL}</a>
      </p>
    </>
  );
}
