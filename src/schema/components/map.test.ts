import { describe, it, expect } from 'vitest';
import type { MapComponent, MapMarker } from './map';

describe('MapComponent', () => {
  it('creates a minimal map component', () => {
    const map: MapComponent = {
      id: 'map1',
      component: 'Map',
    };

    expect(map.id).toBe('map1');
    expect(map.component).toBe('Map');
  });

  it('creates a map with center coordinates', () => {
    const map: MapComponent = {
      id: 'map2',
      component: 'Map',
      center: { lat: 40.7128, lng: -74.0060 },
    };

    expect(map.center).toEqual({ lat: 40.7128, lng: -74.0060 });
  });

  it('creates a map with zoom level', () => {
    const map: MapComponent = {
      id: 'map3',
      component: 'Map',
      zoom: 10,
    };

    expect(map.zoom).toBe(10);
  });

  it('creates a map with title', () => {
    const map: MapComponent = {
      id: 'map4',
      component: 'Map',
      title: 'New York City Map',
    };

    expect(map.title).toBe('New York City Map');
  });

  it('creates a map with markers', () => {
    const map: MapComponent = {
      id: 'map5',
      component: 'Map',
      markers: '/data/markers',
    };

    expect(map.markers).toBe('/data/markers');
  });

  it('creates a map with satellite base layer', () => {
    const map: MapComponent = {
      id: 'map6',
      component: 'Map',
      baseLayer: 'satellite',
    };

    expect(map.baseLayer).toBe('satellite');
  });

  it('creates a map with terrain base layer', () => {
    const map: MapComponent = {
      id: 'map7',
      component: 'Map',
      baseLayer: 'terrain',
    };

    expect(map.baseLayer).toBe('terrain');
  });

  it('creates a map with streets base layer', () => {
    const map: MapComponent = {
      id: 'map8',
      component: 'Map',
      baseLayer: 'streets',
    };

    expect(map.baseLayer).toBe('streets');
  });

  it('creates a map with dark base layer', () => {
    const map: MapComponent = {
      id: 'map9',
      component: 'Map',
      baseLayer: 'dark',
    };

    expect(map.baseLayer).toBe('dark');
  });

  it('creates a map with flyTo animation', () => {
    const map: MapComponent = {
      id: 'map10',
      component: 'Map',
      flyTo: { lat: 51.5074, lng: -0.1278, zoom: 12, duration: 2000 },
    };

    expect(map.flyTo).toEqual({ lat: 51.5074, lng: -0.1278, zoom: 12, duration: 2000 });
  });

  it('creates a map with terrain enabled', () => {
    const map: MapComponent = {
      id: 'map11',
      component: 'Map',
      terrain: true,
    };

    expect(map.terrain).toBe(true);
  });

  it('creates a map with custom dimensions', () => {
    const map: MapComponent = {
      id: 'map12',
      component: 'Map',
      width: 800,
      height: 600,
    };

    expect(map.width).toBe(800);
    expect(map.height).toBe(600);
  });

  it('creates a map with string dimensions', () => {
    const map: MapComponent = {
      id: 'map13',
      component: 'Map',
      width: '100%',
      height: '500px',
    };

    expect(map.width).toBe('100%');
    expect(map.height).toBe('500px');
  });

  it('creates a map with all properties', () => {
    const map: MapComponent = {
      id: 'map14',
      component: 'Map',
      center: { lat: 37.7749, lng: -122.4194 },
      zoom: 12,
      title: 'San Francisco Map',
      markers: '/data/sf-markers',
      baseLayer: 'streets',
      flyTo: { lat: 37.7749, lng: -122.4194, zoom: 14, duration: 1500 },
      terrain: true,
      width: '100%',
      height: '600px',
    };

    expect(map.id).toBe('map14');
    expect(map.component).toBe('Map');
    expect(map.center).toEqual({ lat: 37.7749, lng: -122.4194 });
    expect(map.zoom).toBe(12);
    expect(map.title).toBe('San Francisco Map');
    expect(map.markers).toBe('/data/sf-markers');
    expect(map.baseLayer).toBe('streets');
    expect(map.flyTo).toEqual({ lat: 37.7749, lng: -122.4194, zoom: 14, duration: 1500 });
    expect(map.terrain).toBe(true);
    expect(map.width).toBe('100%');
    expect(map.height).toBe('600px');
  });
});

describe('MapMarker', () => {
  it('creates a minimal marker', () => {
    const marker: MapMarker = {
      lat: 40.7128,
      lng: -74.0060,
    };

    expect(marker.lat).toBe(40.7128);
    expect(marker.lng).toBe(-74.0060);
  });

  it('creates a marker with id', () => {
    const marker: MapMarker = {
      id: 'marker1',
      lat: 51.5074,
      lng: -0.1278,
    };

    expect(marker.id).toBe('marker1');
  });

  it('creates a marker with label', () => {
    const marker: MapMarker = {
      lat: 48.8566,
      lng: 2.3522,
      label: 'Paris',
    };

    expect(marker.label).toBe('Paris');
  });

  it('creates a marker with color', () => {
    const marker: MapMarker = {
      lat: 35.6762,
      lng: 139.6503,
      color: '#ff0000',
    };

    expect(marker.color).toBe('#ff0000');
  });

  it('creates a marker with icon', () => {
    const marker: MapMarker = {
      lat: -33.8688,
      lng: 151.2093,
      icon: 'restaurant',
    };

    expect(marker.icon).toBe('restaurant');
  });

  it('creates a marker with popup', () => {
    const marker: MapMarker = {
      lat: 52.5200,
      lng: 13.4050,
      popup: 'Berlin, Germany',
    };

    expect(marker.popup).toBe('Berlin, Germany');
  });

  it('creates a marker with all properties', () => {
    const marker: MapMarker = {
      id: 'marker2',
      lat: 40.7128,
      lng: -74.0060,
      label: 'New York',
      color: '#0066cc',
      icon: 'city',
      popup: 'New York City',
    };

    expect(marker.id).toBe('marker2');
    expect(marker.lat).toBe(40.7128);
    expect(marker.lng).toBe(-74.0060);
    expect(marker.label).toBe('New York');
    expect(marker.color).toBe('#0066cc');
    expect(marker.icon).toBe('city');
    expect(marker.popup).toBe('New York City');
  });

  it('handles edge case coordinates', () => {
    // Test coordinates at the equator and prime meridian
    const marker: MapMarker = {
      lat: 0,
      lng: 0,
      label: 'Null Island',
    };

    expect(marker.lat).toBe(0);
    expect(marker.lng).toBe(0);
    expect(marker.label).toBe('Null Island');
  });

  it('handles negative coordinates', () => {
    // Test coordinates in the southern and western hemispheres
    const marker: MapMarker = {
      lat: -33.8568,
      lng: -151.2153,
      label: 'Sydney',
    };

    expect(marker.lat).toBe(-33.8568);
    expect(marker.lng).toBe(-151.2153);
    expect(marker.label).toBe('Sydney');
  });

  it('handles extreme coordinates', () => {
    // Test coordinates near the poles
    const northPole: MapMarker = {
      lat: 89.9999,
      lng: 0,
      label: 'Near North Pole',
    };

    const southPole: MapMarker = {
      lat: -89.9999,
      lng: 0,
      label: 'Near South Pole',
    };

    expect(northPole.lat).toBe(89.9999);
    expect(northPole.lng).toBe(0);
    expect(northPole.label).toBe('Near North Pole');

    expect(southPole.lat).toBe(-89.9999);
    expect(southPole.lng).toBe(0);
    expect(southPole.label).toBe('Near South Pole');
  });
});
