'use client';

import dynamic from 'next/dynamic';

// MapLibre needs window — must be loaded client-only.
// Wrapped in a client component because Next 15 disallows dynamic({ssr:false}) in Server Components.
const CoverageMap = dynamic(() => import('./CoverageMap'), { ssr: false });

export default function CoverageMapClient() {
  return <CoverageMap />;
}
