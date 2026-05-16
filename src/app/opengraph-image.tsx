// Dynamic Open Graph image — Next.js 15 file convention.
// Generated at build time for /. Used by Facebook, Twitter, Slack, Discord, LINE, Zalo previews.
// Size 1200×630 (recommended OG aspect ratio 1.91:1).

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NetMap VN — Bản đồ phủ sóng 5G Việt Nam';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #da251d 0%, #b91c1c 100%)',
          padding: 80,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.10) 0%, transparent 35%)',
          }}
        />

        {/* Top: brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
            }}
          >
            📡
          </div>
          <div
            style={{
              color: 'white',
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            NetMap VN
          </div>
        </div>

        {/* Center: hero text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              color: 'white',
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: -1,
              maxWidth: 900,
            }}
          >
            Bản đồ phủ sóng 5G Việt Nam
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 28,
              lineHeight: 1.4,
              maxWidth: 850,
            }}
          >
            Dữ liệu cộng đồng từ speed test và báo cáo sự cố mạng. Minh bạch, mở, miễn phí.
          </div>
        </div>

        {/* Bottom: URL + carrier chips */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: 24,
              fontWeight: 500,
              opacity: 0.95,
            }}
          >
            netmap.penwin.vn
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {['Viettel', 'VNPT', 'MobiFone', 'FPT'].map((c) => (
              <div
                key={c}
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  borderRadius: 24,
                  padding: '8px 18px',
                  color: 'white',
                  fontSize: 18,
                  fontWeight: 500,
                }}
              >
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
