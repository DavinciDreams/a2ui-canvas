/**
 * MapRenderer — Map with markers
 *
 * Uses Cesium/Resium when available (optional peer dep).
 * Falls back to a basic SVG map placeholder with markers.
 */

import React, { useMemo, useState, useEffect } from 'react';
import type { RendererProps } from '../core/ComponentRegistry';
import type { MapComponent, MapMarker } from '../schema/components/map';
import { RendererFrame } from './shared/RendererFrame';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let CesiumViewer: React.ComponentType<any> | null = null;
let cesiumLoadAttempted = false;

async function loadCesium() {
  if (cesiumLoadAttempted) return;
  cesiumLoadAttempted = true;
  try {
    // Use proper dynamic import without @vite-ignore
    const resium = await import('resium');
    CesiumViewer = resium.Viewer;
  } catch {
    // not installed — use fallback
    console.warn('Resium/Cesium library not found. Using fallback SVG rendering.');
  }
}

const MapRenderer: React.FC<RendererProps<MapComponent>> = ({
  component,
  data,
  theme,
}) => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!cesiumLoadAttempted) {
      loadCesium().then(() => forceUpdate((n) => n + 1));
    }
  }, []);

  const markers: MapMarker[] = useMemo(() => {
    if (Array.isArray(data)) return data as MapMarker[];
    return [];
  }, [data]);

  const colors = (theme as { colors?: Record<string, string> })?.colors;
  const primaryColor = colors?.primary ?? '#0ea5e9';

  const title = component?.title;
  const widthVal = typeof component?.width === 'number' ? component.width : 600;
  const heightVal = typeof component?.height === 'number' ? component.height : 400;

  // If Cesium loaded, use it
  if (CesiumViewer) {
    return (
      <RendererFrame title={title}>
        <CesiumViewer style={{ width: '100%', height: `${heightVal}px` }} />
      </RendererFrame>
    );
  }

  // SVG Fallback — a simple world map placeholder
  return (
    <RendererFrame title={title}>
      <div style={{ padding: '12px', overflow: 'auto' }}>
        <svg
          viewBox={`0 0 ${widthVal} ${heightVal}`}
          style={{ width: '100%', height: 'auto', maxWidth: `${widthVal}px`, background: '#1a2332', borderRadius: '4px' }}
        >
          {/* Grid */}
          {Array.from({ length: 7 }, (_, i) => {
            const y = (heightVal / 6) * i;
            return <line key={`h-${i}`} x1={0} y1={y} x2={widthVal} y2={y} stroke="rgba(255,255,255,0.05)" />;
          })}
          {Array.from({ length: 13 }, (_, i) => {
            const x = (widthVal / 12) * i;
            return <line key={`v-${i}`} x1={x} y1={0} x2={x} y2={heightVal} stroke="rgba(255,255,255,0.05)" />;
          })}

          {/* Center crosshair */}
          <circle cx={widthVal / 2} cy={heightVal / 2} r={4} fill="none" stroke={primaryColor} strokeWidth={1} opacity={0.5} />

          {/* Markers */}
          {markers.map((marker, i) => {
            // Simple Mercator-ish projection
            const x = ((marker.lng + 180) / 360) * widthVal;
            const y = ((90 - marker.lat) / 180) * heightVal;
            return (
              <g key={marker.id ?? i}>
                <circle cx={x} cy={y} r={6} fill={marker.color ?? primaryColor} opacity={0.8} />
                {marker.label && (
                  <text x={x} y={y - 10} textAnchor="middle" fill="#fff" fontSize="10">
                    {marker.label}
                  </text>
                )}
              </g>
            );
          })}

          {markers.length === 0 && (
            <text x={widthVal / 2} y={heightVal / 2 + 20} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="14">
              Map — install @cesium/engine + resium for globe rendering
            </text>
          )}
        </svg>
      </div>
    </RendererFrame>
  );
};

export default MapRenderer;
