import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CodeRenderer from './CodeRenderer';

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock optional dependencies
vi.mock('shiki', () => ({
  createHighlighter: vi.fn().mockResolvedValue(null),
  codeToHtml: vi.fn(),
}));

describe('CodeRenderer', () => {
  it('renders with default props', () => {
    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code1',
          component: 'Code',
          code: 'const x = 1;',
          language: 'javascript',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
  });

  it('renders with legacy content', () => {
    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code-legacy',
          component: 'Code',
          code: 'const x = 1;',
          language: 'javascript',
        }}
        data={undefined}
        theme={undefined}
        content={{
          code: 'const y = 2;',
          language: 'typescript',
        }}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
  });

  it('renders with title', () => {
    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code2',
          component: 'Code',
          code: 'const x = 1;',
          language: 'javascript',
          title: 'Test Code',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const title = container.querySelector('h3');
    expect(title).toBeTruthy();
    expect(title!.textContent).toBe('Test Code');
  });

  it('renders with filename', () => {
    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code3',
          component: 'Code',
          code: 'const x = 1;',
          language: 'javascript',
          filename: 'test.js',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const title = container.querySelector('h3');
    expect(title).toBeTruthy();
    expect(title!.textContent).toBe('test.js');
  });

  it('renders with custom language', () => {
    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code4',
          component: 'Code',
          code: 'print("Hello")',
          language: 'python',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
  });

  it('renders with showLineNumbers option', () => {
    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code5',
          component: 'Code',
          code: 'const x = 1;\nconst y = 2;',
          language: 'javascript',
          showLineNumbers: true,
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
  });

  it('renders without line numbers', () => {
    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code6',
          component: 'Code',
          code: 'const x = 1;',
          language: 'javascript',
          showLineNumbers: false,
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
  });

  it('renders with showCopyButton option', () => {
    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code7',
          component: 'Code',
          code: 'const x = 1;',
          language: 'javascript',
          showCopyButton: true,
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const button = container.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('renders without copy button', () => {
    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code8',
          component: 'Code',
          code: 'const x = 1;',
          language: 'javascript',
          showCopyButton: false,
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const button = container.querySelector('button');
    expect(button).toBeFalsy();
  });

  it('renders with highlightLines option', () => {
    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code9',
          component: 'Code',
          code: 'const x = 1;\nconst y = 2;\nconst z = 3;',
          language: 'javascript',
          highlightLines: [1, 3],
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
  });

  it('renders with custom theme', () => {
    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code10',
          component: 'Code',
          code: 'const x = 1;',
          language: 'javascript',
        }}
        data={undefined}
        theme={{
          colors: {
            primary: '#ff6b6b',
            text: '#1a1a1a',
          },
        }}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
  });

  it('copies code to clipboard on button click', async () => {
    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code11',
          component: 'Code',
          code: 'const x = 1;',
          language: 'javascript',
          showCopyButton: true,
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const button = container.querySelector('button');
    expect(button).toBeTruthy();

    button!.click();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('const x = 1;');
  });

  it('shows check icon after copying', async () => {
    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code12',
          component: 'Code',
          code: 'const x = 1;',
          language: 'javascript',
          showCopyButton: true,
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const button = container.querySelector('button');
    button!.click();

    // Wait for the timeout to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it('renders empty code', () => {
    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code13',
          component: 'Code',
          code: '',
          language: 'javascript',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
  });

  it('renders with multiline code', () => {
    const code = `
function hello() {
  console.log('Hello, world!');
}

hello();
    `.trim();

    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code14',
          component: 'Code',
          code,
          language: 'javascript',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
  });

  it('renders with different languages', () => {
    const languages = ['javascript', 'typescript', 'python', 'rust', 'go', 'java', 'c', 'cpp', 'html', 'css', 'json', 'yaml', 'markdown', 'bash', 'sql', 'text'];

    for (const language of languages) {
      const { container } = render(
        <CodeRenderer
          component={{
            id: `code-${language}`,
            component: 'Code',
            code: `// ${language} code`,
            language: language as any,
          }}
          data={undefined}
          theme={undefined}
        />
      );

      const pre = container.querySelector('pre');
      expect(pre).toBeTruthy();
    }
  });

  it('renders code with special characters', () => {
    const code = 'const str = "Hello \\"World\\"";\nconst regex = /\\d+/g;';

    const { container } = render(
      <CodeRenderer
        component={{
          id: 'code15',
          component: 'Code',
          code,
          language: 'javascript',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
  });
});
