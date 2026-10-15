import { describe, it, expect } from 'vitest';
import type { KnowledgeGraphComponent, KnowledgeGraphNode, KnowledgeGraphEdge } from './knowledge-graph';

describe('KnowledgeGraphComponent', () => {
  it('creates a minimal knowledge graph component', () => {
    const graph: KnowledgeGraphComponent = {
      id: 'graph1',
      component: 'KnowledgeGraph',
      nodes: '/data/nodes',
      edges: '/data/edges',
    };

    expect(graph.id).toBe('graph1');
    expect(graph.component).toBe('KnowledgeGraph');
    expect(graph.nodes).toBe('/data/nodes');
    expect(graph.edges).toBe('/data/edges');
  });

  it('creates a knowledge graph with title', () => {
    const graph: KnowledgeGraphComponent = {
      id: 'graph2',
      component: 'KnowledgeGraph',
      nodes: '/data/nodes',
      edges: '/data/edges',
      title: 'Knowledge Graph Visualization',
    };

    expect(graph.title).toBe('Knowledge Graph Visualization');
  });

  it('creates a knowledge graph with force layout', () => {
    const graph: KnowledgeGraphComponent = {
      id: 'graph3',
      component: 'KnowledgeGraph',
      nodes: '/data/nodes',
      edges: '/data/edges',
      layout: 'force',
    };

    expect(graph.layout).toBe('force');
  });

  it('creates a knowledge graph with radial layout', () => {
    const graph: KnowledgeGraphComponent = {
      id: 'graph4',
      component: 'KnowledgeGraph',
      nodes: '/data/nodes',
      edges: '/data/edges',
      layout: 'radial',
    };

    expect(graph.layout).toBe('radial');
  });

  it('creates a knowledge graph with hierarchical layout', () => {
    const graph: KnowledgeGraphComponent = {
      id: 'graph5',
      component: 'KnowledgeGraph',
      nodes: '/data/nodes',
      edges: '/data/edges',
      layout: 'hierarchical',
    };

    expect(graph.layout).toBe('hierarchical');
  });

  it('creates a knowledge graph with 3D enabled', () => {
    const graph: KnowledgeGraphComponent = {
      id: 'graph6',
      component: 'KnowledgeGraph',
      nodes: '/data/nodes',
      edges: '/data/edges',
      threeD: true,
    };

    expect(graph.threeD).toBe(true);
  });

  it('creates a knowledge graph with directed edges', () => {
    const graph: KnowledgeGraphComponent = {
      id: 'graph7',
      component: 'KnowledgeGraph',
      nodes: '/data/nodes',
      edges: '/data/edges',
      directed: true,
    };

    expect(graph.directed).toBe(true);
  });

  it('creates a knowledge graph with labels enabled', () => {
    const graph: KnowledgeGraphComponent = {
      id: 'graph8',
      component: 'KnowledgeGraph',
      nodes: '/data/nodes',
      edges: '/data/edges',
      showLabels: true,
    };

    expect(graph.showLabels).toBe(true);
  });

  it('creates a knowledge graph with custom dimensions', () => {
    const graph: KnowledgeGraphComponent = {
      id: 'graph9',
      component: 'KnowledgeGraph',
      nodes: '/data/nodes',
      edges: '/data/edges',
      width: 1200,
      height: 800,
    };

    expect(graph.width).toBe(1200);
    expect(graph.height).toBe(800);
  });

  it('creates a knowledge graph with string dimensions', () => {
    const graph: KnowledgeGraphComponent = {
      id: 'graph10',
      component: 'KnowledgeGraph',
      nodes: '/data/nodes',
      edges: '/data/edges',
      width: '100%',
      height: '600px',
    };

    expect(graph.width).toBe('100%');
    expect(graph.height).toBe('600px');
  });

  it('creates a knowledge graph with all properties', () => {
    const graph: KnowledgeGraphComponent = {
      id: 'graph11',
      component: 'KnowledgeGraph',
      nodes: '/data/nodes',
      edges: '/data/edges',
      title: 'Complete Knowledge Graph',
      layout: 'force',
      threeD: true,
      directed: true,
      showLabels: true,
      width: '100%',
      height: '500px',
    };

    expect(graph.id).toBe('graph11');
    expect(graph.component).toBe('KnowledgeGraph');
    expect(graph.nodes).toBe('/data/nodes');
    expect(graph.edges).toBe('/data/edges');
    expect(graph.title).toBe('Complete Knowledge Graph');
    expect(graph.layout).toBe('force');
    expect(graph.threeD).toBe(true);
    expect(graph.directed).toBe(true);
    expect(graph.showLabels).toBe(true);
    expect(graph.width).toBe('100%');
    expect(graph.height).toBe('500px');
  });
});

describe('KnowledgeGraphNode', () => {
  it('creates a minimal node', () => {
    const node: KnowledgeGraphNode = {
      id: 'node1',
      label: 'Node 1',
    };

    expect(node.id).toBe('node1');
    expect(node.label).toBe('Node 1');
  });

  it('creates a node with group', () => {
    const node: KnowledgeGraphNode = {
      id: 'node2',
      label: 'Node 2',
      group: 'category1',
    };

    expect(node.group).toBe('category1');
  });

  it('creates a node with color', () => {
    const node: KnowledgeGraphNode = {
      id: 'node3',
      label: 'Node 3',
      color: '#ff0000',
    };

    expect(node.color).toBe('#ff0000');
  });

  it('creates a node with size', () => {
    const node: KnowledgeGraphNode = {
      id: 'node4',
      label: 'Node 4',
      size: 20,
    };

    expect(node.size).toBe(20);
  });

  it('creates a node with metadata', () => {
    const metadata = {
      type: 'person',
      department: 'engineering',
      level: 'senior',
    };

    const node: KnowledgeGraphNode = {
      id: 'node5',
      label: 'Node 5',
      metadata,
    };

    expect(node.metadata).toEqual(metadata);
  });

  it('creates a node with all properties', () => {
    const metadata = {
      created: '2023-01-01',
      updated: '2023-06-15',
      tags: ['important', 'featured'],
    };

    const node: KnowledgeGraphNode = {
      id: 'node6',
      label: 'Complete Node',
      group: 'main',
      color: '#0066cc',
      size: 30,
      metadata,
    };

    expect(node.id).toBe('node6');
    expect(node.label).toBe('Complete Node');
    expect(node.group).toBe('main');
    expect(node.color).toBe('#0066cc');
    expect(node.size).toBe(30);
    expect(node.metadata).toEqual(metadata);
  });
});

describe('KnowledgeGraphEdge', () => {
  it('creates a minimal edge', () => {
    const edge: KnowledgeGraphEdge = {
      source: 'node1',
      target: 'node2',
    };

    expect(edge.source).toBe('node1');
    expect(edge.target).toBe('node2');
  });

  it('creates an edge with label', () => {
    const edge: KnowledgeGraphEdge = {
      source: 'node1',
      target: 'node2',
      label: 'connected to',
    };

    expect(edge.label).toBe('connected to');
  });

  it('creates an edge with weight', () => {
    const edge: KnowledgeGraphEdge = {
      source: 'node1',
      target: 'node2',
      weight: 0.8,
    };

    expect(edge.weight).toBe(0.8);
  });

  it('creates an edge with color', () => {
    const edge: KnowledgeGraphEdge = {
      source: 'node1',
      target: 'node2',
      color: '#00cc00',
    };

    expect(edge.color).toBe('#00cc00');
  });

  it('creates a directed edge', () => {
    const edge: KnowledgeGraphEdge = {
      source: 'node1',
      target: 'node2',
      directed: true,
    };

    expect(edge.directed).toBe(true);
  });

  it('creates an undirected edge', () => {
    const edge: KnowledgeGraphEdge = {
      source: 'node1',
      target: 'node2',
      directed: false,
    };

    expect(edge.directed).toBe(false);
  });

  it('creates an edge with all properties', () => {
    const edge: KnowledgeGraphEdge = {
      source: 'node1',
      target: 'node2',
      label: 'relationship',
      weight: 0.9,
      color: '#cc6600',
      directed: true,
    };

    expect(edge.source).toBe('node1');
    expect(edge.target).toBe('node2');
    expect(edge.label).toBe('relationship');
    expect(edge.weight).toBe(0.9);
    expect(edge.color).toBe('#cc6600');
    expect(edge.directed).toBe(true);
  });
});
