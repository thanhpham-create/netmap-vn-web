import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NetMap VN',
    short_name: 'NetMap',
    description: 'Bản đồ phủ sóng 5G & sự cố mạng di động Việt Nam',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#da251d',
    orientation: 'portrait-primary',
    lang: 'vi',
    categories: ['utilities', 'productivity'],
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
      { name: 'Đo tốc độ',     short_name: 'Speedtest',  url: '/speedtest' },
      { name: 'Báo sự cố',     short_name: 'Sự cố',      url: '/outages' },
      { name: 'So sánh nhà mạng', short_name: 'So sánh',  url: '/compare' },
    ],
  };
}
