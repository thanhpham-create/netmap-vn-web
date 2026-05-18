// 30 tỉnh/thành phố lớn của Việt Nam có sẵn data NetMap VN.
// Slug là phiên âm không dấu, dùng cho URL (vd /coverage/ha-noi).
// `dbName` phải khớp chính xác với cột `province` trong DB (có dấu, có "TP.", v.v.)

export type Province = {
  slug: string;        // URL-safe, no diacritics
  dbName: string;      // Exact value in speed_tests.province
  display: string;     // Tên hiển thị Tiếng Việt có dấu
  region: 'north' | 'central' | 'south';
  // Đại diện cho map fitBounds — không phải center chính xác của tỉnh,
  // chỉ là điểm hợp lý để zoom đến.
  lat: number;
  lng: number;
};

export const PROVINCES: Province[] = [
  // Miền Bắc
  { slug: 'ha-noi',         dbName: 'Hà Nội',            display: 'Hà Nội',         region: 'north', lat: 21.0285, lng: 105.8542 },
  { slug: 'hai-phong',      dbName: 'Hải Phòng',         display: 'Hải Phòng',      region: 'north', lat: 20.8525, lng: 106.6837 },
  { slug: 'quang-ninh',     dbName: 'Quảng Ninh',        display: 'Quảng Ninh',     region: 'north', lat: 20.9711, lng: 107.0466 },
  { slug: 'bac-ninh',       dbName: 'Bắc Ninh',          display: 'Bắc Ninh',       region: 'north', lat: 21.1861, lng: 106.0763 },
  { slug: 'thai-nguyen',    dbName: 'Thái Nguyên',       display: 'Thái Nguyên',    region: 'north', lat: 21.5944, lng: 105.8480 },
  { slug: 'nam-dinh',       dbName: 'Nam Định',          display: 'Nam Định',       region: 'north', lat: 20.4385, lng: 106.1621 },
  { slug: 'phu-tho',        dbName: 'Phú Thọ',           display: 'Phú Thọ',        region: 'north', lat: 21.3227, lng: 105.4024 },
  { slug: 'son-la',         dbName: 'Sơn La',            display: 'Sơn La',         region: 'north', lat: 21.3256, lng: 103.9188 },
  { slug: 'lao-cai',        dbName: 'Lào Cai',           display: 'Lào Cai',        region: 'north', lat: 22.4856, lng: 103.9707 },

  // Miền Trung
  { slug: 'thanh-hoa',      dbName: 'Thanh Hóa',         display: 'Thanh Hóa',      region: 'central', lat: 19.8067, lng: 105.7765 },
  { slug: 'nghe-an',        dbName: 'Nghệ An',           display: 'Nghệ An',        region: 'central', lat: 18.6790, lng: 105.6813 },
  { slug: 'thua-thien-hue', dbName: 'Thừa Thiên Huế',    display: 'Thừa Thiên Huế', region: 'central', lat: 16.4637, lng: 107.5909 },
  { slug: 'da-nang',        dbName: 'Đà Nẵng',           display: 'Đà Nẵng',        region: 'central', lat: 16.0544, lng: 108.2022 },
  { slug: 'quang-nam',      dbName: 'Quảng Nam',         display: 'Quảng Nam',      region: 'central', lat: 15.8801, lng: 108.3380 },
  { slug: 'binh-dinh',      dbName: 'Bình Định',         display: 'Bình Định',      region: 'central', lat: 13.7820, lng: 109.2200 },
  { slug: 'khanh-hoa',      dbName: 'Khánh Hòa',         display: 'Khánh Hòa',      region: 'central', lat: 12.2388, lng: 109.1967 },
  { slug: 'binh-thuan',     dbName: 'Bình Thuận',        display: 'Bình Thuận',     region: 'central', lat: 10.9333, lng: 108.1000 },
  { slug: 'dak-lak',        dbName: 'Đắk Lắk',           display: 'Đắk Lắk',        region: 'central', lat: 12.6667, lng: 108.0500 },
  { slug: 'gia-lai',        dbName: 'Gia Lai',           display: 'Gia Lai',        region: 'central', lat: 13.9833, lng: 108.0000 },
  { slug: 'lam-dong',       dbName: 'Lâm Đồng',          display: 'Lâm Đồng',       region: 'central', lat: 11.9404, lng: 108.4583 },

  // Miền Nam
  { slug: 'tp-ho-chi-minh', dbName: 'TP. Hồ Chí Minh',   display: 'TP. Hồ Chí Minh', region: 'south', lat: 10.7769, lng: 106.7009 },
  { slug: 'dong-nai',       dbName: 'Đồng Nai',          display: 'Đồng Nai',       region: 'south', lat: 10.9472, lng: 106.8430 },
  { slug: 'binh-duong',     dbName: 'Bình Dương',        display: 'Bình Dương',     region: 'south', lat: 10.9803, lng: 106.6519 },
  { slug: 'ba-ria-vung-tau',dbName: 'Bà Rịa - Vũng Tàu', display: 'Bà Rịa - Vũng Tàu', region: 'south', lat: 10.4113, lng: 107.1365 },
  { slug: 'tien-giang',     dbName: 'Tiền Giang',        display: 'Tiền Giang',     region: 'south', lat: 10.3600, lng: 106.3600 },
  { slug: 'can-tho',        dbName: 'Cần Thơ',           display: 'Cần Thơ',        region: 'south', lat: 10.0341, lng: 105.7882 },
  { slug: 'an-giang',       dbName: 'An Giang',          display: 'An Giang',       region: 'south', lat: 10.3863, lng: 105.4359 },
  { slug: 'kien-giang',     dbName: 'Kiên Giang',        display: 'Kiên Giang',     region: 'south', lat: 10.0167, lng: 105.0833 },
  { slug: 'ca-mau',         dbName: 'Cà Mau',            display: 'Cà Mau',         region: 'south', lat: 9.1769,  lng: 105.1500 },
];

export const PROVINCE_BY_SLUG: Record<string, Province> = Object.fromEntries(
  PROVINCES.map((p) => [p.slug, p]),
);

export function regionLabel(region: Province['region'], locale = 'vi'): string {
  if (locale === 'en') {
    return region === 'north' ? 'Northern' : region === 'central' ? 'Central' : 'Southern';
  }
  return region === 'north' ? 'Miền Bắc' : region === 'central' ? 'Miền Trung' : 'Miền Nam';
}
