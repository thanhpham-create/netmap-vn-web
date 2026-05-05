import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://netmap.vn';
  const lastModified = new Date();

  return [
    { url: `${baseUrl}/`,             lastModified, changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${baseUrl}/speedtest`,    lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/outages`,      lastModified, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${baseUrl}/compare`,      lastModified, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${baseUrl}/leaderboard`,  lastModified, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${baseUrl}/badges`,       lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/api-docs`,     lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
