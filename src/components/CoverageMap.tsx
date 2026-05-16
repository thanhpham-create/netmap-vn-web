'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibre, Popup } from 'maplibre-gl';
import { useTranslations } from 'next-intl';
import { api, type HeatmapPoint } from '@/lib/api';
import { track } from '@/lib/analytics';
import CoverageHistoryModal from './CoverageHistoryModal';
import TimelineSlider from './TimelineSlider';

const DEFAULT_CENTER: [number, number] = [106.5, 16.0];
const DEFAULT_ZOOM = 5;
// Vietnam bounding box — fitBounds on mount để chắc chắn thấy toàn quốc
const VN_BOUNDS: [[number, number], [number, number]] = [[102.0, 8.0], [110.0, 24.0]];

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
  const [historyAt, setHistoryAt] = useState<{ lat: number; lng: number } | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);   // null = real-time
  const [showTimeline, setShowTimeline] = useState(false);

  // Init map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    // Reject placeholder values (e.g. user copied from .env.example without replacing)
    const isValidKey = maptilerKey
      && maptilerKey.length > 8
      && !/your[-_]?key|placeholder|example|change[-_]?me/i.test(maptilerKey);
    const styleUrl = isValidKey
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

    // FitBounds vào toàn Việt Nam ngay khi style load xong — đảm bảo người dùng
    // thấy chấm rải khắp 30 tỉnh ngay lần đầu, không bị zoom kẹt ở Đà Nẵng.
    map.once('load', () => {
      map.fitBounds(VN_BOUNDS, { padding: 24, animate: false, duration: 0 });
    });

    // Add 3D building extrusion when style supports it.
    // Detect source name dynamically — different styles use different names
    // (openmaptiles, maptiler_planet, vector, etc.).
    map.on('load', () => {
      try {
        const layers = map.getStyle().layers || [];
        // Find an existing layer that uses the 'building' source-layer to learn its source name
        const buildingLayer = layers.find((l: any) => l['source-layer'] === 'building');
        if (!buildingLayer) {
          console.info('Style has no building source-layer — skipping 3D extrusion');
          return;
        }
        const sourceName = (buildingLayer as any).source;
        if (!sourceName) {
          console.warn('Building layer has no source — skipping 3D');
          return;
        }
        // Insert below labels for clean look
        const labelLayer = layers.find((l: any) => l.type === 'symbol' && l.layout?.['text-field']);
        map.addLayer({
          id: 'building-3d',
          type: 'fill-extrusion',
          source: sourceName,
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
          endDate: endDate ? endDate.toISOString() : undefined,
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
  }, [carrier, endDate]);

  // Render points as circles + click popup
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // BUG FIX: trước đây nếu style chưa load thì effect return luôn,
    // và sẽ không bao giờ chạy lại cho đến khi `points` đổi. Kết quả là
    // map trắng hoặc chỉ hiện vài chấm cũ. Giờ ta đợi style ready rồi render.
    const sourceId = 'coverage-points';

    function doRender() {
      const m = mapRef.current;
      if (!m) return;
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

      if (m.getSource(sourceId)) {
        (m.getSource(sourceId) as maplibregl.GeoJSONSource).setData(data);
      } else {
        m.addSource(sourceId, { type: 'geojson', data });
        m.addLayer({
          id: 'coverage-circles',
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-color': ['get', 'color'],
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              5,  6,
              8,  5,
              12, 7,
              16, 10,
            ],
            'circle-opacity': 0.85,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
        });

        // Click → popup with details
        m.on('click', 'coverage-circles', (e) => {
          const feature = e.features?.[0];
          if (!feature) return;
          const p = feature.properties as any;
          const coords = (feature.geometry as any).coordinates as [number, number];

          popupRef.current?.remove();

          const html = `
            <div style="font-family: -apple-system, sans-serif; font-size: 12px; min-width: 200px;">
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
              <button class="coverage-history-btn"
                      data-lat="${coords[1]}"
                      data-lng="${coords[0]}"
                      style="margin-top: 6px; width: 100%; background: #da251d; color: white; border: 0; border-radius: 4px; padding: 6px 8px; font-size: 11px; font-weight: 500; cursor: pointer;">
                📊 ${t('viewHistory')}
              </button>
              <div style="font-size: 10px; color: #999; margin-top: 4px; text-align: center;">
                ${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}
              </div>
            </div>
          `;

          popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: '280px' })
            .setLngLat(coords)
            .setHTML(html)
            .addTo(m);

          // Wire button click — popup DOM exists after setHTML+addTo
          setTimeout(() => {
            const btn = popupRef.current?.getElement()?.querySelector('.coverage-history-btn') as HTMLButtonElement | null;
            if (btn) {
              btn.onclick = () => {
                const lat = parseFloat(btn.dataset.lat || '0');
                const lng = parseFloat(btn.dataset.lng || '0');
                setHistoryAt({ lat, lng });
                track('coverage_history_opened', { lat: Math.round(lat * 100) / 100, lng: Math.round(lng * 100) / 100 });
              };
            }
          }, 0);
        });

        m.on('mouseenter', 'coverage-circles', () => { m.getCanvas().style.cursor = 'pointer'; });
        m.on('mouseleave', 'coverage-circles', () => { m.getCanvas().style.cursor = ''; });
      }
    }

    // Đợi style sẵn sàng rồi mới render. Nếu style đã load thì gọi ngay.
    if (map.isStyleLoaded()) {
      doRender();
    } else {
      map.once('load', doRender);
    }

    return () => {
      map.off('load', doRender);
    };
  }, [points]);

  return (
    <div className="relative h-[60vh] w-full overflow-hidden rounded-lg border bg-gray-100 shadow-sm md:h-[70vh]">
      <div ref={containerRef} className="h-full w-full" />

      {/* History modal (chỉ render khi user click "Xem lịch sử" trên popup) */}
      {historyAt && (
        <CoverageHistoryModal
          lat={historyAt.lat}
          lng={historyAt.lng}
          onClose={() => setHistoryAt(null)}
        />
      )}

      {/* Carrier filter */}
      <div className="absolute left-2 top-2 z-10 rounded-md bg-white/95 p-2 text-sm shadow-md md:left-3 md:top-3">
        <label className="block text-xs font-medium text-gray-600">{t('carrierLabel')}</label>
        <select
          value={carrier}
          onChange={(e) => {
            const v = e.target.value;
            setCarrier(v);
            track('map_carrier_changed', { carrier: v || 'all' });
          }}
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
        <button
          onClick={() => {
            setShowTimeline((v) => !v);
            if (showTimeline) setEndDate(null);   // turning off → back to real-time
          }}
          className={`mt-1 w-full rounded border px-2 py-1 text-xs ${
            showTimeline
              ? 'border-vnred-500 bg-vnred-50 text-vnred-700'
              : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {showTimeline ? `⏷ ${t('timelineHide')}` : `🕐 ${t('timelineShow')}`}
        </button>
      </div>

      {/* Timeline slider (chỉ hiện khi toggle on) */}
      {showTimeline && (
        <div className="absolute inset-x-2 bottom-2 z-10 md:inset-x-auto md:left-1/2 md:bottom-3 md:-translate-x-1/2 md:max-w-md md:w-[480px]">
          <TimelineSlider monthsBack={12} endDate={endDate} onChange={setEndDate} />
        </div>
      )}

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
