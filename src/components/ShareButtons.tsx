'use client';

// Social share buttons — Facebook, Twitter/X, Zalo, Copy link, native Web Share.
// Lightweight, không depend external libs.

import { useState } from 'react';
import { track } from '@/lib/analytics';

type Props = {
  /** URL tuyệt đối để share. Nếu rỗng → dùng window.location.href. */
  url?: string;
  /** Title share. Mặc định = document.title. */
  title?: string;
  /** Compact mode hide labels, show icons only. */
  compact?: boolean;
};

export default function ShareButtons({ url, title, compact = false }: Props) {
  const [copied, setCopied] = useState(false);

  function resolveUrl(): string {
    if (url) return url;
    if (typeof window !== 'undefined') return window.location.href;
    return 'https://netmap.penwin.vn';
  }
  function resolveTitle(): string {
    if (title) return title;
    if (typeof document !== 'undefined') return document.title;
    return 'NetMap VN';
  }

  function shareFacebook() {
    const u = encodeURIComponent(resolveUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, '_blank', 'noopener,width=600,height=400');
    track('share_clicked', { platform: 'facebook' });
  }

  function shareTwitter() {
    const u = encodeURIComponent(resolveUrl());
    const t = encodeURIComponent(resolveTitle());
    window.open(`https://twitter.com/intent/tweet?url=${u}&text=${t}`, '_blank', 'noopener,width=600,height=400');
    track('share_clicked', { platform: 'twitter' });
  }

  function shareZalo() {
    const u = encodeURIComponent(resolveUrl());
    // Zalo share API — official URL format
    window.open(`https://zalo.me/share?url=${u}`, '_blank', 'noopener,width=600,height=400');
    track('share_clicked', { platform: 'zalo' });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(resolveUrl());
      setCopied(true);
      track('share_clicked', { platform: 'copy' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select + execCommand (deprecated nhưng vẫn work)
      const ta = document.createElement('textarea');
      ta.value = resolveUrl();
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); } catch {}
      document.body.removeChild(ta);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function nativeShare() {
    if (!navigator.share) { copyLink(); return; }
    try {
      await navigator.share({ url: resolveUrl(), title: resolveTitle() });
      track('share_clicked', { platform: 'native' });
    } catch {
      // User cancelled — no-op
    }
  }

  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const btnClass = `inline-flex items-center justify-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition ${
    compact ? 'min-w-9' : ''
  }`;

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={shareFacebook} className={btnClass} aria-label="Share trên Facebook">
        <span aria-hidden style={{ color: '#1877f2' }}>f</span>
        {!compact && <span>Facebook</span>}
      </button>
      <button onClick={shareTwitter} className={btnClass} aria-label="Share trên Twitter / X">
        <span aria-hidden>𝕏</span>
        {!compact && <span>Twitter</span>}
      </button>
      <button onClick={shareZalo} className={btnClass} aria-label="Share qua Zalo">
        <span aria-hidden style={{ color: '#0068ff' }}>z</span>
        {!compact && <span>Zalo</span>}
      </button>
      <button onClick={copyLink} className={btnClass} aria-label="Copy link">
        <span aria-hidden>{copied ? '✓' : '🔗'}</span>
        {!compact && <span>{copied ? 'Đã copy' : 'Copy link'}</span>}
      </button>
      {hasNativeShare && (
        <button onClick={nativeShare} className={btnClass} aria-label="Chia sẻ">
          <span aria-hidden>↗</span>
          {!compact && <span>Khác</span>}
        </button>
      )}
    </div>
  );
}
