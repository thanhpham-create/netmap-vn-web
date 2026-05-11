'use client';

// Catches errors that happen in the root layout itself.
// Must render its own <html> and <body> tags (replaces the layout).
// See: https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry auto-captures via instrumentation; keeping a manual log just in case
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="vi">
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        background: '#fafafa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 480, padding: 24, textAlign: 'center' }}>
          <div style={{
            fontSize: 36,
            marginBottom: 12,
          }}>
            ⚠️
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Có lỗi nghiêm trọng
          </h1>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
            Đã xảy ra lỗi không mong muốn. Đội ngũ NetMap đã được thông báo.
          </p>
          {error.digest && (
            <p style={{ fontSize: 11, color: '#999', marginBottom: 16 }}>
              Mã lỗi: <code>{error.digest}</code>
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                background: '#da251d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Thử lại
            </button>
            <a
              href="/"
              style={{
                background: 'white',
                color: '#333',
                border: '1px solid #d1d5db',
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Về trang chủ
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
