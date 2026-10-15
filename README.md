# @atlas.agents/a2ui-canvas

A2UI-native dynamic canvas component for React. Renders streaming, agent-driven visuals from any A2UI-speaking source — LangChain agents, Microsoft Agent Framework, or direct JSON.

## Features

- **A2UI Protocol**: Native support for the Agent-to-UI message protocol (createSurface, updateDataModel, updateComponents, etc.)
- **9 Renderers**: Chart, Timeline, KnowledgeGraph, Map, Media, Document, Code, Artifact, Custom
- **Streaming**: JSONL, SSE, WebSocket, and direct message ingestion with batched updates
- **Lazy Loading**: Heavy renderers (D3, Cesium, shiki) loaded on demand with SVG fallbacks
- **Schema-Only Export**: Zero-React-dependency `./schema` entry point for server-side / non-JS consumers
- **Multi-Entry Build**: Tree-shake individual renderers via `./renderers/chart`, `./renderers/map`, etc.
- **Theme System**: Built-in light/dark themes with full customization
- **Type Safe**: Full TypeScript support with discriminated union component types
- **Backward Compatible**: Legacy `CanvasProvider`, `useCanvas`, `useCanvasContent` hooks still work

## Installation

```bash
npm install @atlas.agents/a2ui-canvas
```

### Optional Peer Dependencies

Install only the renderers you need:

```bash
# Charts (D3)
npm install d3

# Documents (Markdown)
npm install react-markdown remark-gfm

# Code (syntax highlighting)
npm install shiki

# Knowledge Graph (force-directed)
npm install react-force-graph-2d
# or for 3D:
npm install react-force-graph-3d

# Map (Cesium globe)
npm install @cesium/engine resium
```

All renderers include built-in SVG/HTML fallbacks when their optional deps are not installed.

## Quick Start

### A2UI Messages (recommended)

Feed A2UI JSON messages from your AI agent and the canvas renders automatically:

```tsx
import { useA2UISurface, RendererResolver } from '@atlas.agents/a2ui-canvas';

function AgentCanvas() {
  const { activeSurface, getComponents, resolveData, store } = useA2UISurface({
    sseUrl: '/api/agent/stream',
  });

  if (!activeSurface) return <div>Waiting for agent...</div>;


  return (
    <div>
      {getComponents(activeSurface.id).map((component) => (
        <RendererResolver
          key={component.id}
          component={component}
          data={resolveData(activeSurface.id, '/')}
          theme="dark"
        />
      ))}
    </div>
  );
}
```

### Direct Messages

Process A2UI messages directly without a stream:

```tsx
import { useA2UISurface } from '@atlas.agents/a2ui-canvas';

const messages = [
  { createSurface: { surfaceId: 's1' } },
  {
    updateDataModel: {
      surfaceId: 's1',
      path: '/chart',
      value: { labels: ['Jan', 'Feb', 'Mar'], values: [10, 25, 18] },
    },
  },
  {
    updateComponents: {
      surfaceId: 's1',
      components: [
        {
          id: 'c1',
          component: 'Chart',
          chartType: 'bar',
          data: '/chart',
        },
      ],
    },
  },
];

function App() {
  const { activeSurface, getComponents } = useA2UISurface({ messages });
  // ...render components
}
```

### WebSocket / Fetch Stream

```tsx
// WebSocket
const result = useA2UISurface({ wsUrl: 'wss://agent.example.com/stream' });

// Fetch (JSONL body)
const result = useA2UISurface({
  streamUrl: '/api/agent/generate',
  streamInit: { method: 'POST', body: JSON.stringify({ prompt: '...' }) },
});
```

### Legacy API

The original `CanvasProvider` / `useCanvas` API still works:

```tsx
import { CanvasProvider, useCanvas, themes } from '@atlas.agents/a2ui-canvas';

function App() {
  return (
    <CanvasProvider initialTheme={themes.dark}>
      <MyApp />
    </CanvasProvider>
  );
}

function MyApp() {
  const { content, setContent } = useCanvas();
  // ...
}
```

## A2UI Protocol

The library speaks the A2UI (Agent-to-UI) protocol. Agents send JSON messages to create surfaces, populate data models, and attach components:

### Envelope Messages

| Message | Description |
|---------|-------------|
| `createSurface` | Create a new UI surface (canvas) |
| `destroySurface` | Remove a surface |
| `updateDataModel` | Set data at a JSON Pointer path |
| `updateComponents` | Set or replace components on a surface |
| `removeComponents` | Remove components by ID |
| `appendData` | Append items to an array (streaming convenience) |
| `patchDataModel` | JSON merge-patch the data model |

### Component Types

| Component | Description | Optional Dep |
|-----------|-------------|-------------|
| `Chart` | Bar, line, scatter, pie, area, donut charts | `d3` |
| `Timeline` | Events with alternating/grouped layouts | — |
| `KnowledgeGraph` | Force-directed node-edge graph | `react-force-graph-2d` |
| `Map` | Globe with markers | `@cesium/engine` + `resium` |
| `Media` | Image, video, audio | — |
| `Document` | Markdown/HTML documents | `react-markdown` |
| `Code` | Syntax-highlighted code blocks | `shiki` |
| `Artifact` | Sandboxed iframe (HTML/CSS/JS) | — |
| `Custom` | Registry-key based escape hatch | — |

### Example: Streaming a Chart

```jsonl
{"createSurface":{"surfaceId":"s1","title":"Sales Dashboard"}}
{"updateDataModel":{"surfaceId":"s1","path":"/sales","value":{"labels":["Q1","Q2","Q3","Q4"],"values":[120,340,250,410]}}}
{"updateComponents":{"surfaceId":"s1","components":[{"id":"chart1","component":"Chart","chartType":"bar","data":"/sales","title":"Quarterly Sales"}]}}
```

### Example: Streaming a Timeline

```jsonl
{"createSurface":{"surfaceId":"s1"}}
{"updateDataModel":{"surfaceId":"s1","path":"/events","value":[{"date":"2024-01-15","title":"Project Started","description":"Kickoff meeting"},{"date":"2024-06-01","title":"v1.0 Release","description":"First public release"}]}}
{"updateComponents":{"surfaceId":"s1","components":[{"id":"t1","component":"Timeline","events":"/events","layout":"alternating"}]}}
```

## Schema-Only Import

For server-side validation or non-React consumers (Python, C#, etc.), import types and validation without React:

```ts
import {
  validateMessage,
  validateComponent,
  isA2UIMessage,
  DYNAMIC_CANVAS_CATALOG,
  type A2UIMessage,
  type A2UIComponent,
} from '@atlas.agents/a2ui-canvas/schema';

const msg = { createSurface: { surfaceId: 's1' } };
const result = validateMessage(msg);
// { valid: true, messageType: 'createSurface' }
```

## API Reference

### Hooks

#### `useA2UISurface(options?)`

Primary hook — connects to a stream and manages surfaces.

```ts
interface UseA2UISurfaceOptions {
  sseUrl?: string;           // SSE endpoint
  wsUrl?: string;            // WebSocket endpoint
  streamUrl?: string;        // Fetch stream URL
  streamInit?: RequestInit;  // Fetch init options
  messages?: A2UIMessage[];  // Direct messages
  batchWindow?: number;      // Batch window in ms (default: 50)
  onError?: (error: Error) => void;
  store?: StoreApi<SurfaceManagerStore>; // Shared store
  middleware?: MiddlewareRegistry; // Message processing pipeline
  enableMetrics?: boolean;    // Enable performance tracking
  retryStrategy?: RetryStrategy; // Connection retry configuration
}
```

Returns: `surfaces`, `activeSurface`, `setActiveSurface`, `processMessage`, `processMessages`, `resolveData`, `getComponents`, `store`

#### `useStreamingContent(options)`

Subscribe to a single surface's streaming updates.

```ts
const { surface, components, dataModel, resolveData, updatedAt } = useStreamingContent({
  store,       // from useA2UISurface
  surfaceId,   // surface to watch
});
```

### Individual Renderer Imports

Tree-shake by importing only what you need:

```ts
import ChartRenderer from '@atlas.agents/a2ui-canvas/renderers/chart';
import TimelineRenderer from '@atlas.agents/a2ui-canvas/renderers/timeline';
import KnowledgeGraphRenderer from '@atlas.agents/a2ui-canvas/renderers/knowledge-graph';
import MapRenderer from '@atlas.agents/a2ui-canvas/renderers/map';
import MediaRenderer from '@atlas.agents/a2ui-canvas/renderers/media';
import DocumentRenderer from '@atlas.agents/a2ui-canvas/renderers/document';
import CodeRenderer from '@atlas.agents/a2ui-canvas/renderers/code';
import ArtifactRenderer from '@atlas.agents/a2ui-canvas/renderers/artifact';
```

### Content Analyzer

Auto-detect content type from raw text and convert to A2UI messages:

```ts
import { ContentAnalyzer } from '@atlas.agents/a2ui-canvas';

// Detect content type
ContentAnalyzer.detectType('```js\nconsole.log("hi")\n```'); // 'code'
ContentAnalyzer.detectType('# Hello World');                  // 'document'
ContentAnalyzer.detectType('2024-01-01 Project Start');       // 'timeline'

// Convert to A2UI messages
const messages = ContentAnalyzer.toA2UIMessages('```python\nprint("hello")\n```');
// Returns: [createSurface, updateComponents with Code component]
```

## Theming

```tsx
import {
  themes,
  mergeThemes,
  validateTheme,
  createAccentTheme,
  createHighContrastTheme,
  createDarkTheme,
  themePresets,
  getThemePreset
} from '@atlas.agents/a2ui-canvas';

// Built-in themes
themes.light
themes.dark
themes.default

// Theme utilities
const customTheme = mergeThemes(themes.default, {
  colors: { primary: '#ff6b6b' }
});

// Validate theme
if (validateTheme(customTheme)) {
  // Theme is valid
}

// Create accent theme
const blueTheme = createAccentTheme(themes.default, '#0066cc');

// Create high contrast theme
const highContrast = createHighContrastTheme(themes.default);

// Use theme presets
const greenTheme = getThemePreset('green');
const availablePresets = getThemePresetNames();
```

## Custom Renderers

Register custom renderers by key:

```tsx
import { ComponentRegistry } from '@atlas.agents/a2ui-canvas';

const registry = new ComponentRegistry();
registry.register('MyWidget', () => import('./MyWidget'));

// Then in A2UI messages:
{
  updateComponents: {
    surfaceId: 's1',
    components: [{ id: 'w1', component: 'Custom', rendererKey: 'MyWidget', props: { foo: 'bar' } }]
  }
}
```

## Architecture

```
AI Agent → A2UI JSON → StreamProcessor → SurfaceManager → RendererResolver → React Renderers
               (JSONL/SSE/WS)    (zustand store)     (Suspense + ErrorBoundary)
                                                                     ↓
                                     Chart | Timeline | Graph | Map | Media | Doc | Code | Artifact | Custom
```

- **StreamProcessor**: Parses JSONL, SSE, WebSocket, or direct JSON arrays with middleware support
- **SurfaceManager**: Zustand store managing surfaces, data models, and components
- **RendererResolver**: Suspense + ErrorBoundary wrapper for lazy-loaded renderers
- **ComponentRegistry**: Maps component type strings to React renderer factories
- **MiddlewareRegistry**: Message processing pipeline with before/after hooks
- **MetricsCollector**: Performance monitoring for render times, message processing, and cache hit rates

## Advanced Features

### Middleware System

Process messages through a customizable pipeline with before/after hooks:

```tsx
import { useA2UISurface, MiddlewareRegistry, createLoggingMiddleware, createValidationMiddleware } from '@atlas.agents/a2ui-canvas';

// Create middleware registry
const middleware = new MiddlewareRegistry();

// Register middleware
middleware.register(createLoggingMiddleware({ logLevel: 'info' }));
middleware.register(createValidationMiddleware({
  requiredFields: ['id', 'component'],
  customValidator: (msg) => msg.id !== null
}));

// Use with surface hook
const { activeSurface } = useA2UISurface({
  sseUrl: '/api/stream',
  middleware,
  enableMetrics: true,
});
```

Built-in middleware:
- **Logging**: Log messages with configurable levels
- **Validation**: Validate required fields and custom rules
- **Transformation**: Modify messages in-flight
- **Deduplication**: Filter duplicate messages
- **Rate Limiting**: Throttle message processing

### Performance Monitoring

Track component render times, message processing, and cache performance:

```tsx
import { globalMetrics } from '@atlas.agents/a2ui-canvas';

// Get render statistics
const renderStats = globalMetrics.getRenderStats();
console.log(`Average render time: ${renderStats.avg}ms`);

// Get message processing stats
const processingStats = globalMetrics.getMessageProcessingStats();
console.log(`Processed ${processingStats.count} messages`);

// Get cache hit rates
const cacheStats = globalMetrics.getCacheMetrics();
console.log(`Cache hit rate: ${(cacheStats.hitRate * 100).toFixed(1)}%`);

// Query metrics
const allMetrics = globalMetrics.queryMetrics({
  type: 'timing',
  limit: 100
});
```

### Enhanced Theme System

Create and validate themes with utilities:

```tsx
import {
  mergeThemes,
  validateTheme,
  createAccentTheme,
  themePresets
} from '@atlas.agents/a2ui-canvas';

// Merge themes
const customTheme = mergeThemes(themes.dark, {
  colors: { primary: '#00ff88' }
});

// Validate theme
if (validateTheme(customTheme)) {
  // Use theme
}

// Use presets
const blueTheme = themePresets.blue;
const greenTheme = getThemePreset('green');
```

Available presets:
- **blue**: Blue accent theme
- **green**: Green accent theme
- **red**: Red accent theme
- **purple**: Purple accent theme
- **highContrastLight**: High contrast light theme
- **highContrastDark**: High contrast dark theme

## Bundle Size

| Entry | Gzip |
|-------|------|
| Schema only (`./schema`) | ~2 KB |
| Core + all renderers (`.`) | ~8 KB |
| Individual renderers | 0.4–2.5 KB each |

Heavy dependencies (D3, Cesium, shiki) are loaded on demand when a component requires them.

## Development

```bash
npm install
npm run dev          # Start Vite dev server
npm run build        # Build library (ES + CJS)
npm run type-check   # TypeScript check
npm test             # Run tests (124 tests)
npm run test:watch   # Watch mode
```

## License

MIT
