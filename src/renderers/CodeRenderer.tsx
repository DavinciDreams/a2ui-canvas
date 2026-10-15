/**
 * CodeRenderer — syntax-highlighted code block
 *
 * Uses shiki when available (optional peer dep).
 * Falls back to basic <pre><code> rendering.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import type { RendererProps } from '../core/ComponentRegistry';
import type { CodeComponent } from '../schema/components/code';
import { RendererFrame } from './shared/RendererFrame';

/** Legacy support */
interface LegacyCodeProps {
  content?: { code?: string; language?: string; filename?: string; showCopyButton?: boolean };
}

/** Shiki highlighter cache */
let shikiHighlighter: { codeToHtml: (code: string, opts: { lang: string; theme: string }) => string } | null = null;
let shikiLoadAttempted = false;

async function loadShiki() {
  if (shikiLoadAttempted) return;
  shikiLoadAttempted = true;
  try {
    // Use proper dynamic import without @vite-ignore
    const shiki = await import('shiki');
    shikiHighlighter = await shiki.createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['javascript', 'typescript', 'python', 'rust', 'go', 'java', 'c', 'cpp', 'html', 'css', 'json', 'yaml', 'markdown', 'bash', 'sql', 'text'],
    });
  } catch {
    // shiki not installed — use fallback
    console.warn('Shiki syntax highlighter not found. Using fallback code rendering.');
  }
}

const CodeRenderer: React.FC<RendererProps<CodeComponent> & LegacyCodeProps> = ({
  component,
  theme,
  content: legacyContent,
}) => {
  const [copied, setCopied] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!shikiLoadAttempted) {
      loadShiki().then(() => forceUpdate((n) => n + 1));
    }
  }, []);

  const code = component?.code ?? legacyContent?.code ?? '';
  const language = component?.language ?? legacyContent?.language ?? 'text';
  const filename = component?.filename ?? legacyContent?.filename;
  const showLineNumbers = component?.showLineNumbers ?? true;
  const showCopyButton = component?.showCopyButton ?? legacyContent?.showCopyButton ?? true;
  const highlightLines = component?.highlightLines ?? [];
  const title = component?.title ?? filename ?? language;

  const colors = (theme as { colors?: Record<string, string> })?.colors;
  const primaryColor = colors?.primary ?? '#0ea5e9';

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const highlightedHtml = useMemo(() => {
    if (!shikiHighlighter) return null;
    try {
      return shikiHighlighter.codeToHtml(code, { lang: language, theme: 'github-dark' });
    } catch {
      return null;
    }
  }, [code, language]);

  const actions = showCopyButton ? (
    <button
      onClick={handleCopy}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: primaryColor,
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
      }}
      title="Copy code"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  ) : undefined;

  return (
    <RendererFrame title={title} actions={actions}>
      {highlightedHtml ? (
        <div
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          style={{ fontSize: '13px', lineHeight: 1.5, overflow: 'auto' }}
        />
      ) : (
        <pre style={{
          margin: 0,
          padding: '12px 16px',
          fontSize: '13px',
          lineHeight: 1.5,
          overflow: 'auto',
          background: '#1e293b',
          color: '#e2e8f0',
        }}>
          {showLineNumbers ? (
            code.split('\n').map((line, i) => {
              const lineNum = i + 1;
              const isHighlighted = highlightLines.includes(lineNum);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    background: isHighlighted ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                >
                  <span style={{
                    display: 'inline-block',
                    width: '3em',
                    textAlign: 'right',
                    paddingRight: '1em',
                    color: 'rgba(255,255,255,0.3)',
                    userSelect: 'none',
                    flexShrink: 0,
                  }}>
                    {lineNum}
                  </span>
                  <code>{line}</code>
                </div>
              );
            })
          ) : (
            <code>{code}</code>
          )}
        </pre>
      )}
    </RendererFrame>
  );
};

export default CodeRenderer;
export { CodeRenderer };
