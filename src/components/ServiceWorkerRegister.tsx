'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect PWA launches (?source=pwa from manifest start_url, or display-mode standalone)
    // Track once per session to avoid noise.
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    const isPwaLaunch =
      isStandalone || new URLSearchParams(window.location.search).get('source') === 'pwa';
    if (isPwaLaunch && !sessionStorage.getItem('pwa_launched_tracked')) {
      track('pwa_launched', { standalone: isStandalone });
      sessionStorage.setItem('pwa_launched_tracked', '1');
    }

    if (!('serviceWorker' in navigator)) return;
    // Only register in production — avoid SW caching breaking hot reload
    if (process.env.NODE_ENV !== 'production') return;

    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad);

    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
