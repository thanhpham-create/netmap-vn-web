import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://netmap.vn';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/speedtest', '/outages', '/compare', '/leaderboard', '/badges', '/api-docs'],
        disallow: ['/me', '/admin', '/login'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
