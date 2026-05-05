import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT
  || process.env.NODE_ENV
  || 'development';

if (dsn) {
  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    // Only enable replay in prod (heavier)
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: environment === 'production' ? 1.0 : 0.0,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,        // mask user content from Speedtest, profile etc.
        blockAllMedia: true,
      }),
    ],
    beforeSend(event) {
      // Drop auth headers
      if (event.request?.headers) {
        const h = event.request.headers as Record<string, any>;
        delete h.authorization;
        delete h.Authorization;
      }
      return event;
    },
  });
}
