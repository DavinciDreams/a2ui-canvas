import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import MapRenderer from './MapRenderer';

// Mock optional dependencies
vi.mock('resium', () => ({
  Viewer: null,
}));

describe('MapRenderer', () => {
  it('renders with default props', () => {
    const { container } = render(
      <MapRenderer
        component={{
          id: 'map1',
          component: 'Map',
          markers: '/markers',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders with markers data', () => {
    const markers = [
      { id: '1', lat: 40.7128, lng: -74.0060, label: 'New York' },
      { id: '2', lat: 34.0522, lng: -118.2437, label: 'Los Angeles' },
    ];

    const { container } = render(
      <MapRenderer
        component={{
          id: 'map2',
          component: 'Map',
          markers: '/markers',
        }}
        data={markers}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders with title', () => {
    const { container } = render(
      <MapRenderer
        component={{
          id: 'map3',
          component: 'Map',
          markers: '/markers',
          title: 'Test Map',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const title = container.querySelector('h3');
    expect(title).toBeTruthy();
    expect(title!.textContent).toBe('Test Map');
  });

  it('renders with custom dimensions', () => {
    const { container } = render(
      <MapRenderer
        component={{
          id: 'map4',
          component: 'Map',
          markers: '/markers',
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

  it('renders with custom theme', () => {
    const { container } = render(
      <MapRenderer
        component={{
          id: 'map5',
          component: 'Map',
          markers: '/markers',
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

  it('renders markers with colors', () => {
    const markers = [
      { id: '1', lat: 40.7128, lng: -74.0060, color: '#ff0000' },
      { id: '2', lat: 34.0522, lng: -118.2437, color: '#00ff00' },
    ];

    const { container } = render(
      <MapRenderer
        component={{
          id: 'map6',
          component: 'Map',
          markers: '/markers',
        }}
        data={markers}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders markers with labels', () => {
    const markers = [
      { id: '1', lat: 40.7128, lng: -74.0060, label: 'New York' },
      { id: '2', lat: 34.0522, lng: -118.2437, label: 'Los Angeles' },
    ];

    const { container } = render(
      <MapRenderer
        component={{
          id: 'map7',
          component: 'Map',
          markers: '/markers',
        }}
        data={markers}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders empty map with no markers', () => {
    const { container } = render(
      <MapRenderer
        component={{
          id: 'map8',
          component: 'Map',
          markers: '/markers',
        }}
        data={[]}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders markers at different coordinates', () => {
    const markers = [
      { id: '1', lat: 0, lng: 0 },
      { id: '2', lat: 90, lng: 180 },
      { id: '3', lat: -90, lng: -180 },
    ];

    const { container } = render(
      <MapRenderer
        component={{
          id: 'map9',
          component: 'Map',
          markers: '/markers',
        }}
        data={markers}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('handles string width and height', () => {
    const { container } = render(
      <MapRenderer
        component={{
          id: 'map10',
          component: 'Map',
          markers: '/markers',
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

  it('renders markers without labels', () => {
    const markers = [
      { id: '1', lat: 40.7128, lng: -74.0060 },
      { id: '2', lat: 34.0522, lng: -118.2437 },
    ];

    const { container } = render(
      <MapRenderer
        component={{
          id: 'map11',
          component: 'Map',
          markers: '/markers',
        }}
        data={markers}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders markers with metadata', () => {
    const markers = [
      {
        id: '1',
        lat: 40.7128,
        lng: -74.0060,
        label: 'New York',
        metadata: { population: 8336817 },
      },
    ];

    const { container } = render(
      <MapRenderer
        component={{
          id: 'map12',
          component: 'Map',
          markers: '/markers',
        }}
        data={markers}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
