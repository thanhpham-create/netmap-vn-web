import { ImageResponse } from 'next/og';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#da251d',
          borderRadius: 32,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: 800,
          letterSpacing: '-0.02em',
        }}
      >
        {/* Stylized "N" with signal bars */}
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          {/* Signal bars at top right */}
          <rect x="78" y="16"  width="6" height="14" fill="white" opacity="0.5" rx="2" />
          <rect x="88" y="10"  width="6" height="20" fill="white" opacity="0.7" rx="2" />
          <rect x="98" y="4"   width="6" height="26" fill="white" rx="2" />
          {/* Letter N */}
          <path d="M20 30 L20 100 L32 100 L32 56 L78 100 L90 100 L90 30 L78 30 L78 76 L32 30 Z"
                fill="white" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
