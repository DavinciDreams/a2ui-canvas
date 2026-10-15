import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ArtifactRenderer from './ArtifactRenderer';

describe('ArtifactRenderer', () => {
  it('renders a sandboxed iframe', () => {
    const { container } = render(
      <ArtifactRenderer
        component={{
          id: 'art1',
          component: 'Artifact',
          html: '<h1>Hello</h1>',
          css: 'h1 { color: red; }',
          js: 'console.log("hi")',
          title: 'Test Artifact',
        }}
        data={undefined}
      />
    );

    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe!.getAttribute('sandbox')).toBe('allow-scripts');
    expect(iframe!.getAttribute('title')).toBe('Test Artifact');

    const srcdoc = iframe!.getAttribute('srcdoc')!;
    expect(srcdoc).toContain('<h1>Hello</h1>');
    expect(srcdoc).toContain('h1 { color: red; }');
    expect(srcdoc).toContain('console.log("hi")');
  });

  it('renders with custom sandbox permissions', () => {
    const { container } = render(
      <ArtifactRenderer
        component={{
          id: 'art2',
          component: 'Artifact',
          html: '<p>Test</p>',
          sandboxPermissions: ['allow-scripts', 'allow-same-origin'],
        }}
        data={undefined}
      />
    );

    const iframe = container.querySelector('iframe');
    expect(iframe!.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin');
  });

  it('renders with custom dimensions', () => {
    const { container } = render(
      <ArtifactRenderer
        component={{
          id: 'art3',
          component: 'Artifact',
          html: '<p>Sized</p>',
          width: 800,
          height: 600,
        }}
        data={undefined}
      />
    );

    const iframe = container.querySelector('iframe');
    expect(iframe!.style.width).toBe('800px');
    expect(iframe!.style.height).toBe('600px');
  });
});
