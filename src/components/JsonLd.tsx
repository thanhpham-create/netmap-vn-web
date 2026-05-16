// JSON-LD structured data — báo cho Google biết NetMap VN là gì, để hiển thị rich results.
// Schema.org: Organization + WebSite + SearchAction.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://netmap.penwin.vn';

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}#organization`,
  name: 'NetMap VN',
  alternateName: 'NetMap Vietnam',
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  description: 'Bản đồ phủ sóng & sự cố mạng di động Việt Nam, dữ liệu cộng đồng',
  sameAs: [
    'https://github.com/thanhpham-create/netmap-vn-web',
  ],
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}#website`,
  url: SITE_URL,
  name: 'NetMap VN',
  description: 'Bản đồ phủ sóng 5G Việt Nam, dữ liệu cộng đồng',
  publisher: { '@id': `${SITE_URL}#organization` },
  inLanguage: ['vi-VN', 'en-US'],
};

export default function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
    </>
  );
}
