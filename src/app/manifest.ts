import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NetMap VN — Bản đồ phủ sóng 5G',
    short_name: 'NetMap',
    description: 'Bản đồ phủ sóng 5G & sự cố mạng di động Việt Nam, dữ liệu cộng đồng',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui', 'browser'],
    background_color: '#fafafa',
    theme_color: '#da251d',
    orientation: 'portrait-primary',
    lang: 'vi',
    dir: 'ltr',
    categories: ['utilities', 'productivity', 'navigation'],
    prefer_related_applications: false,
    icons: [
      {
        src: '/icon',         // served by app/icon.tsx
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',   // served by app/apple-icon.tsx
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Đo tốc độ mạng',
        short_name: 'Speedtest',
        description: 'Đo tốc độ 4G/5G/WiFi tại vị trí hiện tại',
        url: '/speedtest',
      },
      {
        name: 'Báo cáo sự cố',
        short_name: 'Sự cố',
        description: 'Mất sóng hoặc bất thường mạng',
        url: '/outages',
      },
      {
        name: 'So sánh nhà mạng',
        short_name: 'So sánh',
        description: 'Viettel · VNPT · MobiFone · Vietnamobile · FPT',
        url: '/compare',
      },
    ],
  };
}
