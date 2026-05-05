import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  },
};

const withIntl = withNextIntl(nextConfig);

// Sentry chỉ wrap khi có DSN VÀ package đã cài. Tránh crash dev nếu chưa setup.
let finalConfig = withIntl;
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const { withSentryConfig } = await import('@sentry/nextjs');
    finalConfig = withSentryConfig(withIntl, {
      org:     process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent:  !process.env.SENTRY_AUTH_TOKEN,
      hideSourceMaps: true,
      disableLogger: true,
    });
  } catch {
    console.warn('⚠️  @sentry/nextjs not installed — skipping Sentry wrap. Run `yarn install`.');
  }
}

export default finalConfig;
