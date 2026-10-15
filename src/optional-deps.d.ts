/**
 * Type declarations for optional peer dependencies
 * These modules may not be installed — they are dynamically imported at runtime.
 */

declare module 'd3' {
  // D3 v7 type definitions
  export interface Selection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
    selectAll<SubGElement extends BaseType>(selector: string): Selection<SubGElement, Datum, PElement, PDatum>;
    selectAll<SubGElement extends BaseType>(selector: SubGElement[]): Selection<SubGElement, Datum, PElement, PDatum>;
    append<GElement extends BaseType>(name: string): Selection<GElement, Datum, PElement, PDatum>;
    attr(name: string, value: null): this;
    attr(name: string, value: string | number | boolean): this;
    attr(name: string, value: (this: GElement, datum: Datum, index: number, groups: PElement[]) => string | number | boolean | null): this;
    style(name: string, value: null): this;
    style(name: string, value: string | number | boolean): this;
    style(name: string, value: (this: GElement, datum: Datum, index: number, groups: PElement[]) => string | number | boolean | null): this;
    text(): string;
    text(value: string): this;
    html(): string;
    html(value: string): this;
    remove(): this;
    on(typenames: string, listener: (this: GElement, datum: Datum, index: number, groups: PElement[]) => void): this;
    data<T>(data: T[]): Selection<GElement, T, PElement, PDatum>;
    join(onenter: (enter: any) => any, onupdate: (update: any) => any, onexit: (exit: any) => any): Selection<GElement, any, PElement, PDatum>;
  }

  export interface BaseType {}
  
  export interface ScaleLinear<Range, Output> {
    (value: number): Output;
    domain(domain: number[]): this;
    range(range: Range[]): this;
    nice(): this;
  }

  export interface ScaleBand<Range> {
    (value: string): number | undefined;
    domain(domain: string[]): this;
    range(range: Range[]): this;
    bandwidth(): number;
    padding(padding: number): this;
  }

  export interface PieArcDatum<Datum> {
    data: Datum;
    value: number;
    index: number;
    startAngle: number;
    endAngle: number;
    padAngle: number;
  }

  export interface Arc<Datum, Rad> {
    innerRadius: Rad;
    outerRadius: Rad;
    startAngle: number;
    endAngle: number;
    padAngle: number;
  }

  export const select: (selector: string) => Selection<HTMLElement, unknown, null, undefined>;
  export const pie: () => <Datum>(data: Datum[]) => PieArcDatum<Datum>[];
  export const arc: () => <Datum, Rad>() => Arc<Datum, Rad>;
  export const line: () => (points: Datum[]) => string | null;
  export const area: () => (points: Datum[]) => string | null;
  export const scaleLinear: () => ScaleLinear<number[], number>;
  export const scaleBand: () => ScaleBand<number[]>;
  export const max: (array: number[], accessor?: (d: any, i: number, array: any[]) => number) => number | undefined;
  export const axisBottom: (scale: ScaleBand<number>) => (selection: Selection<SVGGElement, unknown, null, undefined>) => void;
  export const axisLeft: (scale: ScaleLinear<number[], number>) => (selection: Selection<SVGGElement, unknown, null, undefined>) => void;
  
  const d3: {
    select: typeof select;
    pie: typeof pie;
    arc: typeof arc;
    line: typeof line;
    area: typeof area;
    scaleLinear: typeof scaleLinear;
    scaleBand: typeof scaleBand;
    max: typeof max;
    axisBottom: typeof axisBottom;
    axisLeft: typeof axisLeft;
  };
  
  export = d3;
  export default d3;
}

declare module 'shiki' {
  export interface HighlighterOptions {
    themes: string[];
    langs: string[];
  }

  export interface Highlighter {
    codeToHtml(code: string, opts: { lang: string; theme: string }): string;
  }

  export function createHighlighter(opts: HighlighterOptions): Promise<Highlighter>;
}

declare module 'react-markdown' {
  import type { ComponentType, ReactNode } from 'react';
  
  export interface RemarkPlugin {
    (this: any, tree: any, file: any): void;
  }
  
  export interface ReactMarkdownProps {
    children: string;
    remarkPlugins?: RemarkPlugin[];
    components?: Record<string, ComponentType<any>>;
    [key: string]: any;
  }
  
  const ReactMarkdown: ComponentType<ReactMarkdownProps>;
  export default ReactMarkdown;
}

declare module 'remark-gfm' {
  export const remarkGfm: (this: any, tree: any, file: any) => void;
  export default remarkGfm;
}

declare module 'react-force-graph-2d' {
  import type { ComponentType } from 'react';
  
  export interface GraphData {
    nodes: Array<{
      id: string | number;
      name?: string;
      color?: string;
      val?: number;
      [key: string]: any;
    }>;
    links: Array<{
      source: string | number;
      target: string | number;
      name?: string;
      color?: string;
      [key: string]: any;
    }>;
  }
  
  export interface ForceGraph2DProps {
    graphData: GraphData;
    width?: number;
    height?: number;
    nodeLabel?: string;
    nodeAutoColorBy?: string;
    linkDirectionalArrowLength?: number;
    linkLabel?: string;
    [key: string]: any;
  }
  
  const ForceGraph2D: ComponentType<ForceGraph2DProps>;
  export default ForceGraph2D;
}

declare module 'react-force-graph-3d' {
  import type { ComponentType } from 'react';
  
  export interface ForceGraph3DProps {
    graphData: any;
    width?: number;
    height?: number;
    [key: string]: any;
  }
  
  const ForceGraph3D: ComponentType<ForceGraph3DProps>;
  export default ForceGraph3D;
}

declare module 'resium' {
  import type { ComponentType } from 'react';
  
  export interface ViewerProps {
    style?: React.CSSProperties;
    [key: string]: any;
  }
  
  export const Viewer: ComponentType<ViewerProps>;
}

declare module '@cesium/engine' {
  // Basic Cesium engine types
  export interface CesiumOptions {
    [key: string]: any;
  }
  
  const cesium: {
    [key: string]: any;
  };
  
  export default cesium;
}
