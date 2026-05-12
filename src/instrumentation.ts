// Next.js 15 instrumentation hook — runs on server boot.
// Loads appropriate Sentry config based on runtime.
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

// Re-export Sentry's handler directly — official pattern from @sentry/nextjs v8+.
// Avoids the Request vs RequestInfo type mismatch caused by manual wrapping.
export const onRequestError = Sentry.captureRequestError;
