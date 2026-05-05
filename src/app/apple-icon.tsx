import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          // No border-radius — iOS auto-rounds with squircle
        }}
      >
        <svg width="112" height="112" viewBox="0 0 120 120" fill="none">
          <rect x="78" y="16"  width="6" height="14" fill="white" opacity="0.5" rx="2" />
          <rect x="88" y="10"  width="6" height="20" fill="white" opacity="0.7" rx="2" />
          <rect x="98" y="4"   width="6" height="26" fill="white" rx="2" />
          <path d="M20 30 L20 100 L32 100 L32 56 L78 100 L90 100 L90 30 L78 30 L78 76 L32 30 Z"
                fill="white" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
