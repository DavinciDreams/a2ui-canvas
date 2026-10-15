import { describe, it, expect } from 'vitest';
import type { DocumentComponent } from './document';

describe('DocumentComponent', () => {
  it('creates a minimal document component', () => {
    const document: DocumentComponent = {
      id: 'doc1',
      component: 'Document',
      content: '# Hello World',
    };

    expect(document.id).toBe('doc1');
    expect(document.component).toBe('Document');
    expect(document.content).toBe('# Hello World');
  });

  it('creates a document with title', () => {
    const document: DocumentComponent = {
      id: 'doc2',
      component: 'Document',
      content: 'This is a document.',
      title: 'My Document',
    };

    expect(document.title).toBe('My Document');
  });

  it('creates a document with markdown format', () => {
    const document: DocumentComponent = {
      id: 'doc3',
      component: 'Document',
      content: '# Title\n\nSome **bold** text.',
      format: 'markdown',
    };

    expect(document.format).toBe('markdown');
  });

  it('creates a document with HTML format', () => {
    const document: DocumentComponent = {
      id: 'doc4',
      component: 'Document',
      content: '<h1>Title</h1><p>Some <strong>bold</strong> text.</p>',
      format: 'html',
    };

    expect(document.format).toBe('html');
  });

  it('creates a document with table of contents enabled', () => {
    const document: DocumentComponent = {
      id: 'doc5',
      component: 'Document',
      content: '# Introduction\n\n## Section 1\n\n## Section 2\n\n## Section 3',
      title: 'Document with TOC',
      toc: true,
    };

    expect(document.toc).toBe(true);
  });

  it('creates a document with table of contents disabled', () => {
    const document: DocumentComponent = {
      id: 'doc6',
      component: 'Document',
      content: '# Simple Document\n\nJust some content.',
      title: 'Simple Document',
      toc: false,
    };

    expect(document.toc).toBe(false);
  });

  it('creates a document with all properties', () => {
    const document: DocumentComponent = {
      id: 'doc7',
      component: 'Document',
      content: `# Advanced Document

## Introduction

This is a comprehensive document with various elements.

### Features

- Markdown support
- HTML rendering
- Table of contents

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Conclusion

This demonstrates all document features.`,
      title: 'Advanced Document',
      format: 'markdown',
      toc: true,
    };

    expect(document.id).toBe('doc7');
    expect(document.component).toBe('Document');
    expect(document.title).toBe('Advanced Document');
    expect(document.format).toBe('markdown');
    expect(document.toc).toBe(true);
  });

  it('handles complex markdown content', () => {
    const complexMarkdown = `# Complex Document

## Text Formatting

This document demonstrates **bold**, *italic*, ~~strikethrough~~, and \`inline code\` text.

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested Item 2.1
  - Nested Item 2.2
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

## Links and Images

[Link to Google](https://www.google.com)

![Image Alt Text](https://example.com/image.jpg)

## Tables

| Name  | Age | Occupation     |
|-------|------|---------------|
| John  | 30   | Developer     |
| Jane  | 25   | Designer      |
| Bob   | 35   | Project Manager |

## Blockquotes

> This is a blockquote.
> It can span multiple lines.

## Horizontal Rule

---

## Code Blocks

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

## Task Lists

- [x] Completed task
- [ ] Incomplete task
- [ ] Another incomplete task`;

    const document: DocumentComponent = {
      id: 'doc8',
      component: 'Document',
      content: complexMarkdown,
      format: 'markdown',
      title: 'Complex Markdown Document',
    };

    expect(document.content).toBe(complexMarkdown);
    expect(document.format).toBe('markdown');
    expect(document.title).toBe('Complex Markdown Document');
  });

  it('handles HTML content with various elements', () => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>HTML Document</title>
</head>
<body>
  <header>
    <h1>Main Title</h1>
    <nav>
      <ul>
        <li><a href="#section1">Section 1</a></li>
        <li><a href="#section2">Section 2</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <section id="section1">
      <h2>Section 1</h2>
      <p>This is the first section with <strong>bold text</strong>.</p>
    </section>
    
    <section id="section2">
      <h2>Section 2</h2>
      <p>This is the second section with <em>italic text</em>.</p>
      <img src="image.jpg" alt="Example Image">
    </section>
  </main>
  
  <footer>
    <p>&copy; 2023 Example Company</p>
  </footer>
</body>
</html>`;

    const document: DocumentComponent = {
      id: 'doc9',
      component: 'Document',
      content: htmlContent,
      format: 'html',
      title: 'HTML Document Example',
    };

    expect(document.content).toBe(htmlContent);
    expect(document.format).toBe('html');
    expect(document.title).toBe('HTML Document Example');
  });

  it('handles empty content', () => {
    const document: DocumentComponent = {
      id: 'doc10',
      component: 'Document',
      content: '',
    };

    expect(document.content).toBe('');
  });

  it('handles whitespace-only content', () => {
    const document: DocumentComponent = {
      id: 'doc11',
      component: 'Document',
      content: '   \n\n   ',
    };

    expect(document.content).toBe('   \n\n   ');
  });
});
