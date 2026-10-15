/**
 * DocumentRenderer — markdown/HTML document rendering
 *
 * Uses react-markdown + remark-gfm when available (optional peer dep).
 * Falls back to basic HTML rendering.
 */

import React, { useMemo, useState, useEffect } from 'react';
import type { RendererProps } from '../core/ComponentRegistry';
import type { DocumentComponent } from '../schema/components/document';
import { RendererFrame } from './shared/RendererFrame';

/** Legacy support */
interface LegacyDocumentProps {
  content?: { content?: string; title?: string; format?: string };
}

/** Try to dynamically import react-markdown */
let ReactMarkdownComponent: React.ComponentType<any> | null = null;
let remarkGfmPlugin: unknown = null;
let markdownLoadAttempted = false;

async function loadMarkdown() {
  if (markdownLoadAttempted) return;
  markdownLoadAttempted = true;
  try {
    // Use proper dynamic imports without @vite-ignore
    const [md, gfm] = await Promise.all([
      import('react-markdown'),
      import('remark-gfm').catch(() => null),
    ]);
    ReactMarkdownComponent = md.default;
    if (gfm) remarkGfmPlugin = gfm.default;
  } catch {
    // react-markdown not installed — use fallback
    console.warn('react-markdown library not found. Using fallback text rendering.');
  }
}

const DocumentRenderer: React.FC<RendererProps<DocumentComponent> & LegacyDocumentProps> = ({
  component,
  data,
  theme,
  content: legacyContent,
}) => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!markdownLoadAttempted) {
      loadMarkdown().then(() => forceUpdate((n) => n + 1));
    }
  }, []);

  const docContent = component?.content ?? legacyContent?.content ?? (typeof data === 'string' ? data : '');
  const format = component?.format ?? legacyContent?.format ?? 'markdown';
  const title = component?.title ?? legacyContent?.title;
  const colors = (theme as { colors?: Record<string, string> })?.colors;
  const textColor = colors?.text ?? 'inherit';

  const renderedContent = useMemo(() => {
    if (format === 'html') {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: docContent }}
          style={{ color: textColor, lineHeight: 1.6 }}
        />
      );
    }

    // Markdown
    if (ReactMarkdownComponent) {
      const plugins = remarkGfmPlugin ? [remarkGfmPlugin] : [];
      return (
        <ReactMarkdownComponent remarkPlugins={plugins as any}>
          {docContent}
        </ReactMarkdownComponent>
      );
    }

    // Fallback: render as pre-formatted text with basic markdown styling
    return (
      <div style={{ color: textColor, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
        {docContent}
      </div>
    );
  }, [docContent, format, textColor]);

  return (
    <RendererFrame title={title}>
      <div style={{ padding: '16px', color: textColor }}>
        {renderedContent}
      </div>
    </RendererFrame>
  );
};

export default DocumentRenderer;
export { DocumentRenderer };
