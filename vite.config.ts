import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Dev-only plugin: stubs uninstalled optional peer deps so the dev server
 * doesn't fail on bare-specifier resolution.  Each renderer already wraps
 * its dynamic import in try/catch, so a throwing module triggers the
 * built-in fallback path.
 */
function optionalPeerDeps(): Plugin {
  const deps = new Set([
    'd3', 'react-force-graph-2d', 'react-force-graph-3d',
    'react-markdown', 'remark-gfm', 'shiki',
    '@cesium/engine', 'resium',
  ]);
  return {
    name: 'stub-optional-peer-deps',
    apply: 'serve',
    enforce: 'pre',
    resolveId(id) {
      if (deps.has(id)) return `\0virtual:optional-dep:${id}`;
    },
    load(id) {
      if (id.startsWith('\0virtual:optional-dep:')) {
        return `throw new Error('Optional dependency not installed');`;
      }
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/core': resolve(__dirname, './src/core'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/renderers': resolve(__dirname, './src/renderers'),
      '@/schema': resolve(__dirname, './src/schema'),
      '@/themes': resolve(__dirname, './src/themes'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
    },
  },
  plugins: [
    optionalPeerDeps(),
    react(),
    dts({
      rollupTypes: false,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts'],
    }),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
      emitFile: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        schema: resolve(__dirname, 'src/schema.ts'),
        'renderers/chart': resolve(__dirname, 'src/renderers/ChartRenderer.tsx'),
        'renderers/timeline': resolve(__dirname, 'src/renderers/TimelineRenderer.tsx'),
        'renderers/knowledge-graph': resolve(__dirname, 'src/renderers/KnowledgeGraphRenderer.tsx'),
        'renderers/map': resolve(__dirname, 'src/renderers/MapRenderer.tsx'),
        'renderers/media': resolve(__dirname, 'src/renderers/MediaRenderer.tsx'),
        'renderers/document': resolve(__dirname, 'src/renderers/DocumentRenderer.tsx'),
        'renderers/code': resolve(__dirname, 'src/renderers/CodeRenderer.tsx'),
        'renderers/artifact': resolve(__dirname, 'src/renderers/ArtifactRenderer.tsx'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'lucide-react',
        'zustand',
        'zustand/vanilla',
        // Optional peer deps — always external
        'd3',
        'react-force-graph-2d',
        'react-force-graph-3d',
        'react-markdown',
        'remark-gfm',
        'shiki',
        '@cesium/engine',
        'resium',
      ],
      output: {
        preserveModules: false,
        exports: 'named',
        // Optimize chunk splitting for renderers
        manualChunks: (id) => {
          // Core modules
          if (id.includes('/core/')) {
            return 'core';
          }
          // Utils
          if (id.includes('/utils/')) {
            return 'utils';
          }
          // Hooks
          if (id.includes('/hooks/')) {
            return 'hooks';
          }
          // Schema
          if (id.includes('/schema/')) {
            return 'schema';
          }
          // Themes
          if (id.includes('/themes/')) {
            return 'themes';
          }
          // Renderers (keep separate for tree-shaking)
          if (id.includes('/renderers/')) {
            const match = id.match(/\/renderers\/(\w+)/);
            if (match) {
              return `renderers/${match[1]}`;
            }
          }
          return undefined;
        },
      },
    },
    // Optimize build performance
    minify: 'esbuild',
    target: 'es2020',
    // Reduce bundle size with tree-shaking
    cssCodeSplit: true,
  },
});
