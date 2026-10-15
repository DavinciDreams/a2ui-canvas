import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import KnowledgeGraphRenderer from './KnowledgeGraphRenderer';

// Mock optional dependencies
vi.mock('react-force-graph-2d', () => ({
  default: null,
}));

describe('KnowledgeGraphRenderer', () => {
  it('renders with default props', () => {
    const { container } = render(
      <KnowledgeGraphRenderer
        component={{
          id: 'graph1',
          component: 'KnowledgeGraph',
          nodes: '/nodes',
          edges: '/edges',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders with nodes and edges', () => {
    const graphData = {
      nodes: [
        { id: '1', label: 'Node 1' },
        { id: '2', label: 'Node 2' },
        { id: '3', label: 'Node 3' },
      ],
      edges: [
        { source: '1', target: '2' },
        { source: '2', target: '3' },
      ],
    };

    const { container } = render(
      <KnowledgeGraphRenderer
        component={{
          id: 'graph2',
          component: 'KnowledgeGraph',
          nodes: '/nodes',
          edges: '/edges',
        }}
        data={graphData}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders with title', () => {
    const { container } = render(
      <KnowledgeGraphRenderer
        component={{
          id: 'graph3',
          component: 'KnowledgeGraph',
          nodes: '/nodes',
          edges: '/edges',
          title: 'Test Graph',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const title = container.querySelector('h3');
    expect(title).toBeTruthy();
    expect(title!.textContent).toBe('Test Graph');
  });

  it('renders with custom dimensions', () => {
    const { container } = render(
      <KnowledgeGraphRenderer
        component={{
          id: 'graph4',
          component: 'KnowledgeGraph',
          nodes: '/nodes',
          edges: '/edges',
          width: 800,
          height: 600,
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute('width')).toBe('800');
    expect(svg!.getAttribute('height')).toBe('600');
  });

  it('renders with directed edges', () => {
    const { container } = render(
      <KnowledgeGraphRenderer
        component={{
          id: 'graph5',
          component: 'KnowledgeGraph',
          nodes: '/nodes',
          edges: '/edges',
          directed: true,
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders with custom theme', () => {
    const { container } = render(
      <KnowledgeGraphRenderer
        component={{
          id: 'graph6',
          component: 'KnowledgeGraph',
          nodes: '/nodes',
          edges: '/edges',
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

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders nodes with colors', () => {
    const graphData = {
      nodes: [
        { id: '1', label: 'Node 1', color: '#ff0000' },
        { id: '2', label: 'Node 2', color: '#00ff00' },
      ],
      edges: [],
    };

    const { container } = render(
      <KnowledgeGraphRenderer
        component={{
          id: 'graph7',
          component: 'KnowledgeGraph',
          nodes: '/nodes',
          edges: '/edges',
        }}
        data={graphData}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders nodes with sizes', () => {
    const graphData = {
      nodes: [
        { id: '1', label: 'Node 1', size: 2 },
        { id: '2', label: 'Node 2', size: 3 },
      ],
      edges: [],
    };

    const { container } = render(
      <KnowledgeGraphRenderer
        component={{
          id: 'graph8',
          component: 'KnowledgeGraph',
          nodes: '/nodes',
          edges: '/edges',
        }}
        data={graphData}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders edges with colors', () => {
    const graphData = {
      nodes: [
        { id: '1', label: 'Node 1' },
        { id: '2', label: 'Node 2' },
      ],
      edges: [
        { source: '1', target: '2', color: '#ff0000' },
      ],
    };

    const { container } = render(
      <KnowledgeGraphRenderer
        component={{
          id: 'graph9',
          component: 'KnowledgeGraph',
          nodes: '/nodes',
          edges: '/edges',
        }}
        data={graphData}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders edges with labels', () => {
    const graphData = {
      nodes: [
        { id: '1', label: 'Node 1' },
        { id: '2', label: 'Node 2' },
      ],
      edges: [
        { source: '1', target: '2', label: 'Connection' },
      ],
    };

    const { container } = render(
      <KnowledgeGraphRenderer
        component={{
          id: 'graph10',
          component: 'KnowledgeGraph',
          nodes: '/nodes',
          edges: '/edges',
        }}
        data={graphData}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders empty graph with no nodes', () => {
    const { container } = render(
      <KnowledgeGraphRenderer
        component={{
          id: 'graph11',
          component: 'KnowledgeGraph',
          nodes: '/nodes',
          edges: '/edges',
        }}
        data={{ nodes: [], edges: [] }}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders graph with only nodes', () => {
    const graphData = {
      nodes: [
        { id: '1', label: 'Node 1' },
        { id: '2', label: 'Node 2' },
      ],
      edges: [],
    };

    const { container } = render(
      <KnowledgeGraphRenderer
        component={{
          id: 'graph12',
          component: 'KnowledgeGraph',
          nodes: '/nodes',
          edges: '/edges',
        }}
        data={graphData}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('handles string width and height', () => {
    const { container } = render(
      <KnowledgeGraphRenderer
        component={{
          id: 'graph13',
          component: 'KnowledgeGraph',
          nodes: '/nodes',
          edges: '/edges',
          width: '100%',
          height: '400px',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
