// 6 nhà mạng di động chính của Việt Nam — metadata để render landing pages.

export type Carrier = {
  slug: string;        // URL-safe lowercase
  dbName: string;      // Exact value trong speed_tests.carrier_name
  display: string;     // Tên hiển thị
  color: string;       // Hex màu thương hiệu (cũng dùng trong CoverageMap)
  asn?: number[];      // ASN(s) của carrier (cho /whoami matching)
  tagline?: string;    // Mô tả ngắn
};

export const CARRIERS: Carrier[] = [
  {
    slug: 'viettel',
    dbName: 'Viettel',
    display: 'Viettel',
    color: '#ee0033',
    asn: [7552, 131429],
    tagline: 'Nhà mạng quân đội, thị phần lớn nhất Việt Nam',
  },
  {
    slug: 'vnpt',
    dbName: 'VNPT',
    display: 'VNPT (VinaPhone)',
    color: '#005bbb',
    asn: [45899],
    tagline: 'Tập đoàn Bưu chính Viễn thông Việt Nam',
  },
  {
    slug: 'mobifone',
    dbName: 'MobiFone',
    display: 'MobiFone',
    color: '#1a76d4',
    asn: [45776],
    tagline: 'Nhà mạng GSM đầu tiên tại Việt Nam',
  },
  {
    slug: 'vietnamobile',
    dbName: 'Vietnamobile',
    display: 'Vietnamobile',
    color: '#ff6600',
    asn: [135887],
    tagline: 'Liên doanh Hutchison – Hanoi Telecom',
  },
  {
    slug: 'fpt',
    dbName: 'FPT',
    display: 'FPT Telecom',
    color: '#22c55e',
    asn: [18403],
    tagline: 'Internet & dịch vụ viễn thông FPT',
  },
  {
    slug: 'cmc',
    dbName: 'CMC',
    display: 'CMC Telecom',
    color: '#a855f7',
    asn: [131193],
    tagline: 'Hạ tầng cáp quang doanh nghiệp & dân dụng',
  },
];

export const CARRIER_BY_SLUG: Record<string, Carrier> = Object.fromEntries(
  CARRIERS.map((c) => [c.slug, c]),
);
