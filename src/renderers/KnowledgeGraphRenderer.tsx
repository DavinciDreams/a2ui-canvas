/**
 * KnowledgeGraphRenderer — force-directed knowledge graph
 *
 * Uses react-force-graph-2d (optional peer dep) when available.
 * Falls back to a basic SVG node/edge layout.
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { RendererProps } from '../core/ComponentRegistry';
import type { KnowledgeGraphComponent, KnowledgeGraphNode, KnowledgeGraphEdge } from '../schema/components/knowledge-graph';
import { RendererFrame } from './shared/RendererFrame';

let ForceGraph2DComponent: React.ComponentType<any> | null = null;
let forceGraphLoadAttempted = false;

async function loadForceGraph() {
  if (forceGraphLoadAttempted) return;
  forceGraphLoadAttempted = true;
  try {
    // Use proper dynamic import without @vite-ignore
    const mod = await import('react-force-graph-2d');
    ForceGraph2DComponent = mod.default;
  } catch {
    // not installed — use fallback
    console.warn('react-force-graph-2d library not found. Using fallback SVG rendering.');
  }
}

const KnowledgeGraphRenderer: React.FC<RendererProps<KnowledgeGraphComponent>> = ({
  component,
  data,
  theme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!forceGraphLoadAttempted) {
      loadForceGraph().then(() => forceUpdate((n) => n + 1));
    }
  }, []);

  const colors = (theme as { colors?: Record<string, string> })?.colors;
  const primaryColor = colors?.primary ?? '#0ea5e9';
  const textColor = colors?.text ?? '#0f172a';

  // Resolve data
  const graphData = useMemo(() => {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const d = data as { nodes?: KnowledgeGraphNode[]; edges?: KnowledgeGraphEdge[] };
      return {
        nodes: d.nodes ?? [],
        edges: d.edges ?? [],
      };
    }
    return { nodes: [] as KnowledgeGraphNode[], edges: [] as KnowledgeGraphEdge[] };
  }, [data]);

  const title = component?.title;
  const widthVal = typeof component?.width === 'number' ? component.width : 600;
  const heightVal = typeof component?.height === 'number' ? component.height : 400;

  if (ForceGraph2DComponent) {
    const forceGraphData = {
      nodes: graphData.nodes.map((n) => ({
        id: n.id,
        name: n.label,
        color: n.color ?? primaryColor,
        val: n.size ?? 1,
      })),
      links: graphData.edges.map((e) => ({
        source: e.source,
        target: e.target,
        name: e.label,
        color: e.color,
      })),
    };

    return (
      <RendererFrame title={title}>
        <div ref={containerRef} style={{ width: '100%', height: `${heightVal}px` }}>
          <ForceGraph2DComponent
            graphData={forceGraphData}
            width={widthVal}
            height={heightVal}
            nodeLabel="name"
            nodeAutoColorBy="color"
            linkDirectionalArrowLength={component?.directed ? 4 : 0}
            linkLabel="name"
          />
        </div>
      </RendererFrame>
    );
  }

  // SVG Fallback
  return (
    <RendererFrame title={title}>
      <div style={{ padding: '12px', overflow: 'auto' }}>
        <svg viewBox={`0 0 ${widthVal} ${heightVal}`} style={{ width: '100%', height: 'auto', maxWidth: `${widthVal}px` }}>
          {graphData.nodes.length === 0 ? (
            <text x={widthVal / 2} y={heightVal / 2} textAnchor="middle" fill={textColor} fontSize="14">
              No graph data
            </text>
          ) : (
            <>
              {/* Simple circular layout */}
              {(() => {
                const cx = widthVal / 2;
                const cy = heightVal / 2;
                const radius = Math.min(widthVal, heightVal) * 0.35;
                const nodePositions = new Map<string, { x: number; y: number }>();
                graphData.nodes.forEach((node, i) => {
                  const angle = (2 * Math.PI * i) / graphData.nodes.length;
                  nodePositions.set(node.id, {
                    x: cx + radius * Math.cos(angle),
                    y: cy + radius * Math.sin(angle),
                  });
                });
                return (
                  <>
                    {graphData.edges.map((edge, i) => {
                      const s = nodePositions.get(edge.source);
                      const t = nodePositions.get(edge.target);
                      if (!s || !t) return null;
                      return (
                        <line
                          key={`e-${i}`}
                          x1={s.x} y1={s.y}
                          x2={t.x} y2={t.y}
                          stroke={edge.color ?? '#94a3b8'}
                          strokeWidth={1}
                          opacity={0.5}
                        />
                      );
                    })}
                    {graphData.nodes.map((node) => {
                      const pos = nodePositions.get(node.id)!;
                      return (
                        <g key={node.id}>
                          <circle
                            cx={pos.x} cy={pos.y}
                            r={Math.max(6, (node.size ?? 1) * 6)}
                            fill={node.color ?? primaryColor}
                            opacity={0.8}
                          />
                          <text
                            x={pos.x} y={pos.y + Math.max(6, (node.size ?? 1) * 6) + 14}
                            textAnchor="middle"
                            fill={textColor}
                            fontSize="11"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </>
          )}
        </svg>
      </div>
    </RendererFrame>
  );
};

export default KnowledgeGraphRenderer;
