// Browser NetworkInformation API helpers.
// Support: Chrome, Edge, Android Chrome. NOT supported on Safari/iOS.
//
// Used to detect WiFi vs cellular and approximate cellular speed tier.

type NetworkConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'wimax' | 'none' | 'other' | 'unknown';
type NetworkEffectiveType = 'slow-2g' | '2g' | '3g' | '4g';

type NavigatorConnection = {
  type?: NetworkConnectionType;
  effectiveType?: NetworkEffectiveType;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};

function getConnection(): NavigatorConnection | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as unknown as { connection?: NavigatorConnection; mozConnection?: NavigatorConnection; webkitConnection?: NavigatorConnection };
  return nav.connection || nav.mozConnection || nav.webkitConnection || null;
}

/**
 * Detect the user's network type and map to one of our networkType options.
 * Returns null if browser doesn't support NetworkInformation API (Safari).
 */
export function detectNetworkType(): {
  networkType: '5G' | '4G+' | '4G' | '3G' | '2G' | 'WIFI' | null;
  rawType: NetworkConnectionType | null;
  rawEffective: NetworkEffectiveType | null;
} {
  const conn = getConnection();
  if (!conn) return { networkType: null, rawType: null, rawEffective: null };

  const type = conn.type ?? null;
  const eff = conn.effectiveType ?? null;

  // WiFi/ethernet → fixed-line
  if (type === 'wifi' || type === 'ethernet') {
    return { networkType: 'WIFI', rawType: type, rawEffective: eff };
  }

  // Cellular → map effectiveType to our tier
  if (type === 'cellular') {
    if (eff === 'slow-2g' || eff === '2g') return { networkType: '2G', rawType: type, rawEffective: eff };
    if (eff === '3g') return { networkType: '3G', rawType: type, rawEffective: eff };
    if (eff === '4g') {
      // effectiveType can't be '5g' yet (spec limit). Use downlink as hint:
      // 5G typically > 100 Mbps. But this is heuristic, not reliable.
      if ((conn.downlink ?? 0) > 100) return { networkType: '5G', rawType: type, rawEffective: eff };
      return { networkType: '4G', rawType: type, rawEffective: eff };
    }
    return { networkType: '4G', rawType: type, rawEffective: eff };  // safe default
  }

  // Type unknown — guess from effectiveType only
  if (eff === '4g') return { networkType: 'WIFI', rawType: type, rawEffective: eff };  // could be either
  if (eff === '3g') return { networkType: '3G', rawType: type, rawEffective: eff };

  return { networkType: null, rawType: type, rawEffective: eff };
}
