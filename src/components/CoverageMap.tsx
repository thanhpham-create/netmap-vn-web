'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibre, Popup } from 'maplibre-gl';
import { useTranslations } from 'next-intl';
import { api, type HeatmapPoint } from '@/lib/api';

const DEFAULT_CENTER: [number, number] = [108.2022, 16.0544];
const DEFAULT_ZOOM = 6;

const QUALITY_COLOR: Record<string, string> = {
  excellent: '#10b981',
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
  const popupRef = useRef<Popup | null>(null);
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [carrier, setCarrier] = useState<string>('');

  // Init map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    const styleUrl = maptilerKey
      ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`
      : 'https://demotiles.maplibre.org/style.json';
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: 0,
      maxPitch: 60,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right');
    mapRef.current = map;

    // Add 3D building extrusion when style supports it (MapTiler streets-v2 has 'building' source layer).
    map.on('load', () => {
      try {
        const layers = map.getStyle().layers || [];
        const hasBuildings = layers.some((l: any) => l['source-layer'] === 'building');
        if (hasBuildings) {
          // Insert below labels for clean look
          const labelLayer = layers.find((l: any) => l.type === 'symbol' && l.layout?.['text-field']);
          map.addLayer({
            id: 'building-3d',
            type: 'fill-extrusion',
            source: 'openmaptiles',  // MapTiler default source name
            'source-layer': 'building',
            minzoom: 14,
            paint: {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                14, 0,
                15.5, ['coalesce', ['get', 'render_height'], ['get', 'height'], 5],
              ],
              'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
              'fill-extrusion-opacity': 0.6,
            },
          }, labelLayer?.id);
        }
      } catch (err) {
        console.warn('3D buildings unavailable for current style', err);
      }
    });

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

    if (map.loaded()) loadHeatmap();
    else map.once('load', loadHeatmap);
    map.on('moveend', loadHeatmap);

    return () => {
      cancelled = true;
      map.off('moveend', loadHeatmap);
    };
  }, [carrier]);

  // Render points as circles + click popup
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const sourceId = 'coverage-points';
    const features = points.map((p) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lngGrid, p.latGrid] },
      properties: {
        color: QUALITY_COLOR[qualityFor(p.avgDownloadMbps)],
        download: p.avgDownloadMbps,
        latency: p.avgLatencyMs,
        samples: p.sampleCount,
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
          // Bigger dots when zoomed out (visible at country level), smaller when zoomed in
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            5,  6,    // country zoom — chấm to
            8,  5,
            12, 7,
            16, 10,   // street zoom — chấm to hơn lại để click
          ],
          'circle-opacity': 0.85,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Click → popup with details
      map.on('click', 'coverage-circles', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const p = feature.properties as any;
        const coords = (feature.geometry as any).coordinates as [number, number];

        // Close existing popup
        popupRef.current?.remove();

        const html = `
          <div style="font-family: -apple-system, sans-serif; font-size: 12px; min-width: 180px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong>${p.carrier} · ${p.network}</strong>
              <span style="background: ${p.color}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">
                ${qualityFor(Number(p.download))}
              </span>
            </div>
            <table style="width: 100%; font-size: 11px;">
              <tr><td>↓ Download</td><td style="text-align: right; font-weight: 600;">${p.download} Mbps</td></tr>
              <tr><td>Ping</td><td style="text-align: right;">${p.latency} ms</td></tr>
              <tr><td>Samples</td><td style="text-align: right;">${p.samples}</td></tr>
            </table>
            <div style="font-size: 10px; color: #999; margin-top: 4px;">
              ${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}
            </div>
          </div>
        `;

        popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: '280px' })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map);
      });

      // Cursor pointer over dots
      map.on('mouseenter', 'coverage-circles', () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', 'coverage-circles', () => map.getCanvas().style.cursor = '');
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
          <option value="FPT">FPT</option>
          <option value="CMC">CMC</option>
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
