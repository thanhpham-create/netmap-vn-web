// Next.js 15 instrumentation hook — runs on server boot.
// Loads appropriate Sentry config based on runtime.

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = (
  err: unknown,
  request: Request,
  context: { routerKind: string; routePath: string; routeType: string },
) => {
  // Lazy import to avoid bundling Sentry into edge code if not needed
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureRequestError(err, request, context);
  });
};
