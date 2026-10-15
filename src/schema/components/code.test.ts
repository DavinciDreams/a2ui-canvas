import { describe, it, expect } from 'vitest';
import type { CodeComponent } from './code';

describe('CodeComponent', () => {
  it('creates a minimal code component', () => {
    const code: CodeComponent = {
      id: 'code1',
      component: 'Code',
      code: 'console.log("Hello World");',
    };

    expect(code.id).toBe('code1');
    expect(code.component).toBe('Code');
    expect(code.code).toBe('console.log("Hello World");');
  });

  it('creates a code component with language', () => {
    const code: CodeComponent = {
      id: 'code2',
      component: 'Code',
      code: 'print("Hello World")',
      language: 'python',
    };

    expect(code.language).toBe('python');
  });

  it('creates a code component with title', () => {
    const code: CodeComponent = {
      id: 'code3',
      component: 'Code',
      code: 'function hello() { return "Hello"; }',
      title: 'Hello Function',
    };

    expect(code.title).toBe('Hello Function');
  });

  it('creates a code component with filename', () => {
    const code: CodeComponent = {
      id: 'code4',
      component: 'Code',
      code: 'export default function App() { return <div>App</div>; }',
      language: 'typescript',
      filename: 'App.tsx',
    };

    expect(code.filename).toBe('App.tsx');
  });

  it('creates a code component with highlight lines', () => {
    const code: CodeComponent = {
      id: 'code5',
      component: 'Code',
      code: 'const a = 1;\nconst b = 2;\nconst c = 3;',
      highlightLines: [1, 3],
    };

    expect(code.highlightLines).toEqual([1, 3]);
  });

  it('creates a code component with line numbers enabled', () => {
    const code: CodeComponent = {
      id: 'code6',
      component: 'Code',
      code: 'const x = 42;',
      showLineNumbers: true,
    };

    expect(code.showLineNumbers).toBe(true);
  });

  it('creates a code component with copy button enabled', () => {
    const code: CodeComponent = {
      id: 'code7',
      component: 'Code',
      code: 'const message = "Hello World";',
      showCopyButton: true,
    };

    expect(code.showCopyButton).toBe(true);
  });

  it('creates a code component with all properties', () => {
    const code: CodeComponent = {
      id: 'code8',
      component: 'Code',
      code: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}',
      language: 'javascript',
      title: 'Fibonacci Function',
      filename: 'fibonacci.js',
      highlightLines: [2, 3],
      showLineNumbers: true,
      showCopyButton: true,
    };

    expect(code.id).toBe('code8');
    expect(code.component).toBe('Code');
    expect(code.code).toBe('function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}');
    expect(code.language).toBe('javascript');
    expect(code.title).toBe('Fibonacci Function');
    expect(code.filename).toBe('fibonacci.js');
    expect(code.highlightLines).toEqual([2, 3]);
    expect(code.showLineNumbers).toBe(true);
    expect(code.showCopyButton).toBe(true);
  });

  it('handles multiline code correctly', () => {
    const multilineCode = `class Calculator {
  constructor() {
    this.result = 0;
  }
  
  add(num) {
    this.result += num;
    return this;
  }
}`;

    const code: CodeComponent = {
      id: 'code9',
      component: 'Code',
      code: multilineCode,
      language: 'javascript',
      showLineNumbers: true,
    };

    expect(code.code).toBe(multilineCode);
    expect(code.showLineNumbers).toBe(true);
  });

  it('handles special characters in code', () => {
    const specialCode = 'console.log("特殊字符 🚀");\n// Comment with emoji 🎉';
    
    const code: CodeComponent = {
      id: 'code10',
      component: 'Code',
      code: specialCode,
      language: 'javascript',
    };

    expect(code.code).toBe(specialCode);
  });
});
