import type { MetadataRoute } from 'next';
import { PROVINCES } from '@/lib/provinces';
import { CARRIERS } from '@/lib/carriers';
import { POSTS } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://netmap.penwin.vn';
  const lastModified = new Date();

  const corePages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`,             lastModified, changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${baseUrl}/speedtest`,    lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/outages`,      lastModified, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${baseUrl}/compare`,      lastModified, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${baseUrl}/leaderboard`,  lastModified, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${baseUrl}/badges`,       lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/coverage`,     lastModified, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${baseUrl}/carriers`,     lastModified, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${baseUrl}/blog`,         lastModified, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${baseUrl}/about`,        lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/terms`,        lastModified, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/privacy`,      lastModified, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/status`,       lastModified, changeFrequency: 'hourly',  priority: 0.3 },
    { url: `${baseUrl}/api-docs`,     lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ];

  // 30 province landing pages — high-priority SEO targets (long-tail keywords)
  const provincePages: MetadataRoute.Sitemap = PROVINCES.map((p) => ({
    url: `${baseUrl}/coverage/${p.slug}`,
    lastModified,
    changeFrequency: 'daily' as const,
    priority: 0.75,
  }));

  // 6 carrier landing pages
  const carrierPages: MetadataRoute.Sitemap = CARRIERS.map((c) => ({
    url: `${baseUrl}/carriers/${c.slug}`,
    lastModified,
    changeFrequency: 'daily' as const,
    priority: 0.75,
  }));

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...corePages, ...provincePages, ...carrierPages, ...blogPages];
}
