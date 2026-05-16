// Wrapper quanh @vercel/analytics — chỉ track key actions, không track PII.
// Vercel Analytics có sẵn pageview + web vitals tracking, ta thêm custom event ở đây.

import { track as vercelTrack } from '@vercel/analytics';

// Event taxonomy — giữ ngắn, snake_case, có ý nghĩa kinh doanh.
// Props phải KHÔNG chứa PII (no phone, no exact coords, no userId).
export type AnalyticsEvent =
  | 'speedtest_started'
  | 'speedtest_completed'   // props: download_bucket, carrier, network_type
  | 'speedtest_submitted'
  | 'outage_reported'        // props: carrier, outage_type
  | 'map_carrier_changed'    // props: carrier
  | 'compare_viewed'         // props: province, days
  | 'leaderboard_viewed'     // props: tab, period
  | 'install_prompt_shown'   // props: platform (ios|android)
  | 'install_prompt_accepted'
  | 'notification_subscribed'
  | 'pwa_launched';          // detect ?source=pwa in URL

type Props = Record<string, string | number | boolean | null>;

/**
 * Track an event. No-op when Analytics not loaded (dev mode, blocked, etc.).
 * Coerces values to safe types automatically.
 */
export function track(event: AnalyticsEvent, props?: Props) {
  try {
    if (typeof window === 'undefined') return; // SSR safety
    vercelTrack(event, props as any);
  } catch {
    // Silent — analytics never blocks UX
  }
}

/**
 * Bucket continuous numbers into ranges so we get useful aggregates
 * without exposing individual values.
 */
export function bucketSpeedMbps(mbps: number): string {
  if (mbps < 1) return '<1';
  if (mbps < 5) return '1-5';
  if (mbps < 20) return '5-20';
  if (mbps < 50) return '20-50';
  if (mbps < 100) return '50-100';
  if (mbps < 300) return '100-300';
  if (mbps < 1000) return '300-1000';
  return '1000+';
}
