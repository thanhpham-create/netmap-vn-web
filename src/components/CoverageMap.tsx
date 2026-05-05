'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibre } from 'maplibre-gl';
import { useTranslations } from 'next-intl';
import { api, type HeatmapPoint } from '@/lib/api';

// Vietnam bounds, center on Da Nang
const DEFAULT_CENTER: [number, number] = [108.2022, 16.0544];
const DEFAULT_ZOOM = 6;

const QUALITY_COLOR: Record<string, string> = {
  excellent: '#10b981', // green
  good:      '#84cc16',
  fair:      '#facc15',
  poor:      '#f97316',
  very_poor: '#ef4444',
};

function qualityFor(downloadMbps: number): string {
  if (downloadMbps >= 100) return 'excellent';
  if (downloadMbps >= 50)  return 'good';
  if (downloadMbps >= 20)  return 'fair';
  if (downloadMbps >= 5)   return 'poor';
  return 'very_poor';
}

export default function CoverageMap() {
  const t = useTranslations('map');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibre | null>(null);
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [carrier, setCarrier] = useState<string>('');

  // Init map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    // Use MapTiler if NEXT_PUBLIC_MAPTILER_KEY is set (free 100k req/mo at maptiler.com),
    // otherwise fall back to demotiles (low quality).
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    const styleUrl = maptilerKey
      ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`
      : 'https://demotiles.maplibre.org/style.json';
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Refetch on movement OR carrier change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let cancelled = false;
    async function loadHeatmap() {
      const m = mapRef.current!;
      const bounds = m.getBounds();
      setLoading(true);
      try {
        const res = await api.heatmap({
          minLat: bounds.getSouth(),
          maxLat: bounds.getNorth(),
          minLng: bounds.getWest(),
          maxLng: bounds.getEast(),
          carrier: carrier || undefined,
          days: 30,
        });
        if (!cancelled) setPoints(res.points);
      } catch (err) {
        if (!cancelled) console.error('heatmap fetch failed', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Trigger fetch immediately when carrier changes (don't wait for map move)
    if (map.loaded()) {
      loadHeatmap();
    } else {
      map.once('load', loadHeatmap);
    }
    map.on('moveend', loadHeatmap);

    return () => {
      cancelled = true;
      map.off('moveend', loadHeatmap);
    };
  }, [carrier]);

  // Render points as circles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const sourceId = 'coverage-points';
    const features = points.map((p) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lngGrid, p.latGrid] },
      properties: {
        color: QUALITY_COLOR[qualityFor(p.avgDownloadMbps)],
        size: Math.min(8, 2 + Math.log2(p.sampleCount + 1)),
        download: p.avgDownloadMbps,
        carrier: p.carrierName,
        network: p.networkType,
      },
    }));
    const data = { type: 'FeatureCollection' as const, features };

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(data);
    } else {
      map.addSource(sourceId, { type: 'geojson', data });
      map.addLayer({
        id: 'coverage-circles',
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': ['get', 'size'],
          'circle-opacity': 0.7,
          'circle-stroke-width': 0.5,
          'circle-stroke-color': '#ffffff',
        },
      });
    }
  }, [points]);

  return (
    <div className="relative h-[60vh] w-full overflow-hidden rounded-lg border bg-gray-100 shadow-sm md:h-[70vh]">
      <div ref={containerRef} className="h-full w-full" />

      {/* Carrier filter */}
      <div className="absolute left-2 top-2 z-10 rounded-md bg-white/95 p-2 text-sm shadow-md md:left-3 md:top-3">
        <label className="block text-xs font-medium text-gray-600">{t('carrierLabel')}</label>
        <select
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          className="mt-1 rounded border px-2 py-1 text-sm"
        >
          <option value="">{t('carrierAll')}</option>
          <option value="Viettel">Viettel</option>
          <option value="VNPT">VNPT</option>
          <option value="MobiFone">MobiFone</option>
          <option value="Vietnamobile">Vietnamobile</option>
        </select>
        {loading && <p className="mt-1 text-xs text-gray-500">{t('loading')}</p>}
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-10 rounded-md bg-white/95 p-2 text-xs shadow-md md:bottom-3 md:left-3">
        <p className="mb-1 font-semibold text-gray-700">{t('speedLegend')}</p>
        {[
          ['excellent', '≥ 100'],
          ['good', '50–100'],
          ['fair', '20–50'],
          ['poor', '5–20'],
          ['very_poor', '< 5'],
        ].map(([k, label]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: QUALITY_COLOR[k] }} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
        <p className="mt-1 text-[10px] text-gray-400">{t('mbps')}</p>
      </div>
    </div>
  );
}
