// Điều khoản sử dụng / Terms of Service.
// Bản template dạng MVP — cover các điểm thiết yếu. Trước khi launch chính thức
// quy mô lớn nên rà soát lại với luật sư (đặc biệt Nghị định 13/2023 & 53/2022).

import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng · NetMap VN',
  description: 'Điều khoản & quy định khi sử dụng NetMap VN',
};

const EFFECTIVE_DATE = '14 tháng 5, 2026';
const CONTACT_EMAIL = 'hello@penwin.vn';

export default async function TermsPage() {
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
          <Link href="/privacy" className="text-vnred-600 hover:underline">
            {isVN ? 'Chính sách bảo mật →' : 'Privacy Policy →'}
          </Link>
        </p>
      </article>
    </div>
  );
}

function ContentVN() {
  return (
    <>
      <h1>Điều khoản sử dụng</h1>
      <p className="lead text-gray-600">
        Bằng việc sử dụng NetMap VN, bạn đồng ý với các điều khoản dưới đây. Vui lòng đọc kỹ.
      </p>

      <h2>1. Về NetMap VN</h2>
      <p>
        NetMap VN là dự án phi lợi nhuận do cộng đồng đóng góp, cung cấp bản đồ phủ sóng mạng di động
        5G/4G và phát hiện sự cố mạng tại Việt Nam dựa trên dữ liệu cộng đồng tự nguyện đóng góp.
      </p>

      <h2>2. Tài khoản và xác thực</h2>
      <ul>
        <li>Bạn có thể sử dụng NetMap VN ở chế độ ẩn danh (chỉ cần thiết bị).</li>
        <li>Nếu đăng ký bằng số điện thoại (qua OTP), bạn cam kết số điện thoại thuộc sở hữu hợp pháp của bạn.</li>
        <li>Bạn chịu trách nhiệm về tất cả hoạt động phát sinh dưới tài khoản của mình.</li>
      </ul>

      <h2>3. Quy tắc sử dụng</h2>
      <p>Bạn đồng ý KHÔNG:</p>
      <ul>
        <li>Gửi dữ liệu giả mạo, sai sự thật, hoặc nhằm mục đích phá hoại;</li>
        <li>Sử dụng bot/script tự động để spam dữ liệu;</li>
        <li>Thử khai thác lỗ hổng bảo mật hoặc tấn công hệ thống;</li>
        <li>Vi phạm quyền sở hữu trí tuệ hoặc luật pháp Việt Nam;</li>
        <li>Sử dụng dữ liệu của NetMap VN cho mục đích thương mại trái phép.</li>
      </ul>

      <h2>4. Dữ liệu bạn đóng góp</h2>
      <p>
        Khi bạn thực hiện speed test hoặc báo cáo sự cố, bạn cấp cho NetMap VN giấy phép không độc quyền,
        không thời hạn, miễn phí để sử dụng, hiển thị, và phân phối dữ liệu đó dưới dạng tổng hợp (aggregate),
        không định danh cá nhân, để phục vụ mục đích của dịch vụ.
      </p>

      <h2>5. Tính chính xác của dữ liệu</h2>
      <p>
        NetMap VN cung cấp thông tin theo nguyên tắc &quot;as is&quot; (nguyên trạng). Dữ liệu là kết quả tổng hợp
        từ cộng đồng và CÓ THỂ KHÔNG CHÍNH XÁC. Bạn không nên dựa hoàn toàn vào NetMap VN cho các quyết định
        quan trọng (như chọn nhà mạng, đầu tư hạ tầng).
      </p>

      <h2>6. Giới hạn trách nhiệm</h2>
      <p>
        NetMap VN không chịu trách nhiệm với bất kỳ thiệt hại trực tiếp, gián tiếp, hoặc hệ quả nào phát sinh
        từ việc sử dụng dịch vụ, bao gồm nhưng không giới hạn: mất dữ liệu, gián đoạn dịch vụ, hoặc quyết định
        dựa trên dữ liệu NetMap.
      </p>

      <h2>7. Sửa đổi điều khoản</h2>
      <p>
        Chúng tôi có quyền cập nhật điều khoản này bất kỳ lúc nào. Phiên bản mới có hiệu lực ngay khi đăng tải
        trên website. Tiếp tục sử dụng dịch vụ sau khi cập nhật = bạn đồng ý với điều khoản mới.
      </p>

      <h2>8. Liên hệ</h2>
      <p>
        Mọi câu hỏi về điều khoản này, vui lòng liên hệ:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-vnred-600 underline">
          {CONTACT_EMAIL}
        </a>
      </p>
    </>
  );
}

function ContentEN() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="lead text-gray-600">
        By using NetMap VN, you agree to these terms. Please read carefully.
      </p>

      <h2>1. About NetMap VN</h2>
      <p>
        NetMap VN is a non-profit community-driven project providing a coverage map for 5G/4G mobile
        networks and outage detection in Vietnam, based on voluntary crowdsourced contributions.
      </p>

      <h2>2. Account and authentication</h2>
      <ul>
        <li>You may use NetMap VN anonymously (device-only).</li>
        <li>If you register with a phone number (via OTP), you confirm legal ownership of the number.</li>
        <li>You are responsible for all activity under your account.</li>
      </ul>

      <h2>3. Acceptable use</h2>
      <p>You agree NOT to:</p>
      <ul>
        <li>Submit fake, falsified, or sabotage-intent data;</li>
        <li>Use bots or automated scripts to spam data;</li>
        <li>Attempt to exploit vulnerabilities or attack the system;</li>
        <li>Infringe intellectual property or violate Vietnamese law;</li>
        <li>Use NetMap VN data for unauthorized commercial purposes.</li>
      </ul>

      <h2>4. Data you contribute</h2>
      <p>
        When you run a speed test or report an outage, you grant NetMap VN a non-exclusive, perpetual,
        royalty-free license to use, display, and distribute that data in aggregated, de-identified form
        for the service&apos;s purpose.
      </p>

      <h2>5. Data accuracy</h2>
      <p>
        NetMap VN is provided &quot;as is&quot;. Data is aggregated from the community and MAY BE INACCURATE.
        Do not rely solely on NetMap VN for important decisions (e.g. carrier selection, infrastructure
        investment).
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        NetMap VN is not liable for any direct, indirect, or consequential damages arising from your use
        of the service, including but not limited to: data loss, service interruption, or decisions made
        based on NetMap data.
      </p>

      <h2>7. Changes to terms</h2>
      <p>
        We may update these terms at any time. New versions take effect upon posting. Continued use after
        an update means you accept the new terms.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions about these terms:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-vnred-600 underline">
          {CONTACT_EMAIL}
        </a>
      </p>
    </>
  );
}
