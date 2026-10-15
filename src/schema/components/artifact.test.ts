import { describe, it, expect } from 'vitest';
import type { ArtifactComponent } from './artifact';

describe('ArtifactComponent', () => {
  it('creates a minimal artifact component', () => {
    const artifact: ArtifactComponent = {
      id: 'artifact1',
      component: 'Artifact',
    };

    expect(artifact.id).toBe('artifact1');
    expect(artifact.component).toBe('Artifact');
  });

  it('creates an artifact with HTML content', () => {
    const artifact: ArtifactComponent = {
      id: 'artifact2',
      component: 'Artifact',
      html: '<div>Hello World</div>',
    };

    expect(artifact.html).toBe('<div>Hello World</div>');
  });

  it('creates an artifact with CSS and JS', () => {
    const artifact: ArtifactComponent = {
      id: 'artifact3',
      component: 'Artifact',
      html: '<div class="styled">Content</div>',
      css: '.styled { color: red; }',
      js: 'console.log("Loaded");',
    };

    expect(artifact.css).toBe('.styled { color: red; }');
    expect(artifact.js).toBe('console.log("Loaded");');
  });

  it('creates an artifact with title', () => {
    const artifact: ArtifactComponent = {
      id: 'artifact4',
      component: 'Artifact',
      title: 'Test Artifact',
      html: '<div>Content</div>',
    };

    expect(artifact.title).toBe('Test Artifact');
  });

  it('creates an artifact with sandbox permissions', () => {
    const artifact: ArtifactComponent = {
      id: 'artifact5',
      component: 'Artifact',
      html: '<div>Content</div>',
      sandboxPermissions: ['allow-scripts', 'allow-same-origin'],
    };

    expect(artifact.sandboxPermissions).toEqual(['allow-scripts', 'allow-same-origin']);
  });

  it('creates an artifact with numeric dimensions', () => {
    const artifact: ArtifactComponent = {
      id: 'artifact6',
      component: 'Artifact',
      html: '<div>Content</div>',
      width: 800,
      height: 600,
    };

    expect(artifact.width).toBe(800);
    expect(artifact.height).toBe(600);
  });

  it('creates an artifact with string dimensions', () => {
    const artifact: ArtifactComponent = {
      id: 'artifact7',
      component: 'Artifact',
      html: '<div>Content</div>',
      width: '100%',
      height: '400px',
    };

    expect(artifact.width).toBe('100%');
    expect(artifact.height).toBe('400px');
  });

  it('creates an artifact with all properties', () => {
    const artifact: ArtifactComponent = {
      id: 'artifact8',
      component: 'Artifact',
      html: '<div>Full Content</div>',
      css: 'body { margin: 0; }',
      js: 'console.log("Ready");',
      title: 'Complete Artifact',
      sandboxPermissions: ['allow-scripts', 'allow-forms', 'allow-popups'],
      width: '100%',
      height: '500px',
    };

    expect(artifact.id).toBe('artifact8');
    expect(artifact.component).toBe('Artifact');
    expect(artifact.html).toBe('<div>Full Content</div>');
    expect(artifact.css).toBe('body { margin: 0; }');
    expect(artifact.js).toBe('console.log("Ready");');
    expect(artifact.title).toBe('Complete Artifact');
    expect(artifact.sandboxPermissions).toEqual(['allow-scripts', 'allow-forms', 'allow-popups']);
    expect(artifact.width).toBe('100%');
    expect(artifact.height).toBe('500px');
  });
});
