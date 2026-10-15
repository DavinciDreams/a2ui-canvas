/**
 * ChartRenderer — SVG charts using D3 when available (optional peer dep)
 *
 * Supports: bar, line, scatter, pie, area, donut, radar, heatmap
 * Falls back to a basic SVG bar chart when D3 is not installed.
 */

import React, { useEffect, useRef, useMemo, useState } from 'react';
import type { RendererProps } from '../core/ComponentRegistry';
import type { ChartComponent } from '../schema/components/chart';
import { RendererFrame } from './shared/RendererFrame';

/** Legacy support */
interface LegacyChartProps {
  content?: {
    data?: { labels: string[]; values: number[] };
    options?: { colors?: string[]; chartType?: string };
  };
}

interface ChartDataItem {
  label: string;
  value: number;
  [key: string]: unknown;
}

/** Try loading D3 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let d3Module: any = null;
let d3LoadAttempted = false;

async function loadD3() {
  if (d3LoadAttempted) return;
  d3LoadAttempted = true;
  try {
    // Use a try-catch block with proper dynamic import
    // This allows Vite to properly analyze the dependency
    const module = await import('d3');
    d3Module = module.default || module;
  } catch {
    // d3 not installed — use SVG fallback
    console.warn('D3 library not found. Using fallback SVG rendering.');
  }
}

const ChartRenderer: React.FC<RendererProps<ChartComponent> & LegacyChartProps> = ({
  component,
  data,
  theme,
  content: legacyContent,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!d3LoadAttempted) {
      loadD3().then(() => forceUpdate((n) => n + 1));
    }
  }, []);

  // Resolve chart data
  const chartData: ChartDataItem[] = useMemo(() => {
    if (Array.isArray(data)) return data as ChartDataItem[];
    if (legacyContent?.data) {
      const { labels, values } = legacyContent.data;
      return labels.map((label: string, i: number) => ({ label, value: values[i] ?? 0 }));
    }
    return [];
  }, [data, legacyContent]);

  const chartType = component?.chartType ?? legacyContent?.options?.chartType ?? 'bar';
  const chartColors = component?.colors ?? legacyContent?.options?.colors ?? [];
  const title = component?.title;
  const colors = (theme as { colors?: Record<string, string> })?.colors;
  const primaryColor = colors?.primary ?? '#0ea5e9';
  const textColor = colors?.text ?? '#0f172a';
  const mutedColor = colors?.muted ?? '#64748b';
  const borderColor = colors?.border ?? '#e2e8f0';

  const widthVal = typeof component?.width === 'number' ? component.width : 600;
  const heightVal = typeof component?.height === 'number' ? component.height : 300;

  // D3-based rendering
  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = svgRef.current;
    // Clear previous
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    if (d3Module) {
      renderWithD3(svg, d3Module, chartData, chartType, chartColors, {
        width: widthVal,
        height: heightVal,
        primaryColor,
        textColor,
        mutedColor,
        borderColor,
        xAxis: component?.xAxis,
        yAxis: component?.yAxis,
      });
    } else {
      renderFallback(svg, chartData, chartType, chartColors, {
        width: widthVal,
        height: heightVal,
        primaryColor,
        textColor,
        mutedColor,
        borderColor,
      });
    }
  }, [chartData, chartType, chartColors, widthVal, heightVal, primaryColor, textColor, mutedColor, borderColor, component]);

  return (
    <RendererFrame title={title}>
      <div style={{ padding: '12px', overflow: 'auto' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${widthVal} ${heightVal}`}
          style={{ width: '100%', height: 'auto', maxWidth: `${widthVal}px` }}
        />
      </div>
    </RendererFrame>
  );
};

function getColor(colors: string[], index: number, fallback: string): string {
  if (colors.length > 0) return colors[index % colors.length];
  const palette = ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
  return palette[index % palette.length] || fallback;
}

interface RenderOptions {
  width: number;
  height: number;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  xAxis?: { label?: string };
  yAxis?: { label?: string };
}

function renderWithD3(
  svg: SVGSVGElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  d3: any,
  data: ChartDataItem[],
  chartType: string,
  colors: string[],
  opts: RenderOptions,
) {
  const { width, height } = opts;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const root = d3.select(svg);
  const g = root.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  if (chartType === 'pie' || chartType === 'donut') {
    const radius = Math.min(innerWidth, innerHeight) / 2;
    const pieG = root.append('g').attr('transform', `translate(${width / 2},${height / 2})`);
    const pie = d3.pie().value((d: ChartDataItem) => d.value);
    const arc = d3.arc()
      .innerRadius(chartType === 'donut' ? radius * 0.5 : 0)
      .outerRadius(radius);

    pieG.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (_: unknown, i: number) => getColor(colors, i, opts.primaryColor))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Labels
    const labelArc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);
    pieG.selectAll('text')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('transform', (d: unknown) => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', opts.textColor)
      .text((d: { data: ChartDataItem }) => d.data.label);
    return;
  }

  // Bar / Line / Scatter / Area
  const x = d3.scaleBand().domain(data.map((d) => d.label)).range([0, innerWidth]).padding(0.2);
  const y = d3.scaleLinear().domain([0, d3.max(data, (d: ChartDataItem) => d.value) ?? 1]).nice().range([innerHeight, 0]);

  // Axes
  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('fill', opts.mutedColor)
    .attr('font-size', '11px');

  g.append('g')
    .call(d3.axisLeft(y).ticks(5))
    .selectAll('text')
    .attr('fill', opts.mutedColor)
    .attr('font-size', '11px');

  // Grid lines
  g.append('g')
    .attr('opacity', 0.1)
    .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat((): string => ''))
    .select('.domain').remove();

  if (chartType === 'bar') {
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: ChartDataItem) => x(d.label) ?? 0)
      .attr('y', (d: ChartDataItem) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d: ChartDataItem) => innerHeight - y(d.value))
      .attr('fill', (_: unknown, i: number) => getColor(colors, i, opts.primaryColor))
      .attr('rx', 2);
  } else if (chartType === 'line' || chartType === 'area') {
    const line = d3.line()
      .x((d: ChartDataItem) => (x(d.label) ?? 0) + x.bandwidth() / 2)
      .y((d: ChartDataItem) => y(d.value));

    if (chartType === 'area') {
      const area = d3.area()
        .x((d: ChartDataItem) => (x(d.label) ?? 0) + x.bandwidth() / 2)
        .y0(innerHeight)
        .y1((d: ChartDataItem) => y(d.value));
      g.append('path')
        .datum(data)
        .attr('d', area)
        .attr('fill', getColor(colors, 0, opts.primaryColor))
        .attr('opacity', 0.2);
    }

    g.append('path')
      .datum(data)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', getColor(colors, 0, opts.primaryColor))
      .attr('stroke-width', 2);

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d: ChartDataItem) => (x(d.label) ?? 0) + x.bandwidth() / 2)
      .attr('cy', (d: ChartDataItem) => y(d.value))
      .attr('r', 3)
      .attr('fill', getColor(colors, 0, opts.primaryColor));
  } else if (chartType === 'scatter') {
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d: ChartDataItem) => (x(d.label) ?? 0) + x.bandwidth() / 2)
      .attr('cy', (d: ChartDataItem) => y(d.value))
      .attr('r', 5)
      .attr('fill', (_: unknown, i: number) => getColor(colors, i, opts.primaryColor))
      .attr('opacity', 0.7);
  }
}

function renderFallback(
  svg: SVGSVGElement,
  data: ChartDataItem[],
  chartType: string,
  colors: string[],
  opts: RenderOptions,
) {
  const { width, height, textColor, mutedColor, borderColor } = opts;
  const padding = 40;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const ns = 'http://www.w3.org/2000/svg';

  // Axes
  const axisLine = document.createElementNS(ns, 'line');
  Object.entries({ x1: padding, y1: padding, x2: padding, y2: height - padding, stroke: borderColor }).forEach(([k, v]) => axisLine.setAttribute(k, String(v)));
  svg.appendChild(axisLine);

  const baseLine = document.createElementNS(ns, 'line');
  Object.entries({ x1: padding, y1: height - padding, x2: width - padding, y2: height - padding, stroke: borderColor }).forEach(([k, v]) => baseLine.setAttribute(k, String(v)));
  svg.appendChild(baseLine);

  if (chartType === 'bar' || chartType === 'line' || chartType === 'scatter' || chartType === 'area') {
    const barWidth = innerWidth / data.length - 8;

    data.forEach((item, i) => {
      const barHeight = (item.value / maxValue) * innerHeight;
      const x = padding + i * (barWidth + 8) + 4;
      const y = height - padding - barHeight;

      if (chartType === 'bar') {
        const rect = document.createElementNS(ns, 'rect');
        Object.entries({ x, y, width: barWidth, height: barHeight, fill: getColor(colors, i, opts.primaryColor), rx: 2 }).forEach(([k, v]) => rect.setAttribute(k, String(v)));
        svg.appendChild(rect);
      } else {
        const circle = document.createElementNS(ns, 'circle');
        Object.entries({ cx: x + barWidth / 2, cy: y, r: chartType === 'scatter' ? 5 : 3, fill: getColor(colors, 0, opts.primaryColor) }).forEach(([k, v]) => circle.setAttribute(k, String(v)));
        svg.appendChild(circle);
      }

      // Label
      const label = document.createElementNS(ns, 'text');
      Object.entries({ x: x + barWidth / 2, y: height - padding + 16, 'text-anchor': 'middle', fill: mutedColor, 'font-size': '11' }).forEach(([k, v]) => label.setAttribute(k, String(v)));
      label.textContent = item.label;
      svg.appendChild(label);

      // Value
      const val = document.createElementNS(ns, 'text');
      Object.entries({ x: x + barWidth / 2, y: y - 6, 'text-anchor': 'middle', fill: textColor, 'font-size': '11' }).forEach(([k, v]) => val.setAttribute(k, String(v)));
      val.textContent = String(item.value);
      svg.appendChild(val);
    });

    // Line for line/area chart
    if (chartType === 'line' || chartType === 'area') {
      const points = data.map((item, i) => {
        const barWidth2 = innerWidth / data.length - 8;
        const x = padding + i * (barWidth2 + 8) + 4 + barWidth2 / 2;
        const y = height - padding - (item.value / maxValue) * innerHeight;
        return `${x},${y}`;
      });
      const polyline = document.createElementNS(ns, 'polyline');
      polyline.setAttribute('points', points.join(' '));
      polyline.setAttribute('fill', 'none');
      polyline.setAttribute('stroke', getColor(colors, 0, opts.primaryColor));
      polyline.setAttribute('stroke-width', '2');
      svg.appendChild(polyline);
    }
  }
}

export default ChartRenderer;
export { ChartRenderer };
