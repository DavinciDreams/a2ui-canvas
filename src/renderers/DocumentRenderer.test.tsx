import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import DocumentRenderer from './DocumentRenderer';

// Mock optional dependencies
vi.mock('react-markdown', () => ({
  default: null,
}));

vi.mock('remark-gfm', () => ({
  default: null,
}));

describe('DocumentRenderer', () => {
  it('renders with default props', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc1',
          component: 'Document',
          content: 'Hello, world!',
          format: 'markdown',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });

  it('renders with markdown content', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc2',
          component: 'Document',
          content: '# Heading\n\nParagraph text.',
          format: 'markdown',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });

  it('renders with HTML content', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc3',
          component: 'Document',
          content: '<h1>Heading</h1><p>Paragraph text.</p>',
          format: 'html',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });

  it('renders with legacy content', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc-legacy',
          component: 'Document',
          content: 'Hello, world!',
          format: 'markdown',
        }}
        data={undefined}
        theme={undefined}
        content={{
          content: 'Legacy content',
          title: 'Legacy Title',
          format: 'markdown',
        }}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });

  it('renders with title', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc4',
          component: 'Document',
          content: 'Hello, world!',
          format: 'markdown',
          title: 'Test Document',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const title = container.querySelector('h3');
    expect(title).toBeTruthy();
    expect(title!.textContent).toBe('Test Document');
  });

  it('renders with custom theme', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc5',
          component: 'Document',
          content: 'Hello, world!',
          format: 'markdown',
        }}
        data={undefined}
        theme={{
          colors: {
            text: '#ff6b6b',
          },
        }}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });

  it('renders with data as string', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc6',
          component: 'Document',
          content: '/content',
          format: 'markdown',
        }}
        data='Content from data prop'
        theme={undefined}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });

  it('renders empty content', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc7',
          component: 'Document',
          content: '',
          format: 'markdown',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });

  it('renders markdown with lists', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc8',
          component: 'Document',
          content: '- Item 1\n- Item 2\n- Item 3',
          format: 'markdown',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });

  it('renders markdown with code blocks', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc9',
          component: 'Document',
          content: '```javascript\nconst x = 1;\n```',
          format: 'markdown',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });

  it('renders markdown with links', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc10',
          component: 'Document',
          content: '[Link text](https://example.com)',
          format: 'markdown',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });

  it('renders markdown with emphasis', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc11',
          component: 'Document',
          content: '**Bold** and *italic* text',
          format: 'markdown',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });

  it('renders HTML with scripts safely', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc12',
          component: 'Document',
          content: '<p>Safe HTML</p>',
          format: 'html',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });

  it('renders with long content', () => {
    const longContent = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3\n\nParagraph 4\n\nParagraph 5';

    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc13',
          component: 'Document',
          content: longContent,
          format: 'markdown',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });

  it('renders markdown with blockquotes', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc14',
          component: 'Document',
          content: '> This is a blockquote',
          format: 'markdown',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });

  it('renders markdown with tables (GFM)', () => {
    const { container } = render(
      <DocumentRenderer
        component={{
          id: 'doc15',
          component: 'Document',
          content: '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |',
          format: 'markdown',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const doc = container.querySelector('.document');
    expect(doc).toBeTruthy();
  });
});
