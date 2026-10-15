import { describe, it, expect } from 'vitest';
import type { TimelineComponent, TimelineComponentEvent } from './timeline';

describe('TimelineComponent', () => {
  describe('TimelineComponent', () => {
    it('creates a minimal timeline component', () => {
      const timeline: TimelineComponent = {
        id: 'timeline1',
        component: 'Timeline',
        events: '/events',
      };

      expect(timeline.id).toBe('timeline1');
      expect(timeline.component).toBe('Timeline');
      expect(timeline.events).toBe('/events');
    });

    it('creates a timeline with title', () => {
      const timeline: TimelineComponent = {
        id: 'timeline2',
        component: 'Timeline',
        events: '/events',
        title: 'Test Timeline',
      };

      expect(timeline.title).toBe('Test Timeline');
    });

    it('creates a timeline with vertical orientation', () => {
      const timeline: TimelineComponent = {
        id: 'timeline3',
        component: 'Timeline',
        events: '/events',
        orientation: 'vertical',
      };

      expect(timeline.orientation).toBe('vertical');
    });

    it('creates a timeline with horizontal orientation', () => {
      const timeline: TimelineComponent = {
        id: 'timeline4',
        component: 'Timeline',
        events: '/events',
        orientation: 'horizontal',
      };

      expect(timeline.orientation).toBe('horizontal');
    });

    it('creates a timeline with default layout', () => {
      const timeline: TimelineComponent = {
        id: 'timeline5',
        component: 'Timeline',
        events: '/events',
        layout: 'default',
      };

      expect(timeline.layout).toBe('default');
    });

    it('creates a timeline with alternating layout', () => {
      const timeline: TimelineComponent = {
        id: 'timeline6',
        component: 'Timeline',
        events: '/events',
        layout: 'alternating',
      };

      expect(timeline.layout).toBe('alternating');
    });

    it('creates a timeline with grouped layout', () => {
      const timeline: TimelineComponent = {
        id: 'timeline7',
        component: 'Timeline',
        events: '/events',
        layout: 'grouped',
      };

      expect(timeline.layout).toBe('grouped');
    });

    it('creates a timeline with groupBy', () => {
      const timeline: TimelineComponent = {
        id: 'timeline8',
        component: 'Timeline',
        events: '/events',
        groupBy: 'category',
      };

      expect(timeline.groupBy).toBe('category');
    });

    it('creates a timeline with zoomable enabled', () => {
      const timeline: TimelineComponent = {
        id: 'timeline9',
        component: 'Timeline',
        events: '/events',
        zoomable: true,
      };

      expect(timeline.zoomable).toBe(true);
    });

    it('creates a timeline with showDates enabled', () => {
      const timeline: TimelineComponent = {
        id: 'timeline10',
        component: 'Timeline',
        events: '/events',
        showDates: true,
      };

      expect(timeline.showDates).toBe(true);
    });

    it('creates a timeline with showDates disabled', () => {
      const timeline: TimelineComponent = {
        id: 'timeline11',
        component: 'Timeline',
        events: '/events',
        showDates: false,
      };

      expect(timeline.showDates).toBe(false);
    });

    it('creates a timeline with showDescriptions enabled', () => {
      const timeline: TimelineComponent = {
        id: 'timeline12',
        component: 'Timeline',
        events: '/events',
        showDescriptions: true,
      };

      expect(timeline.showDescriptions).toBe(true);
    });

    it('creates a timeline with showDescriptions disabled', () => {
      const timeline: TimelineComponent = {
        id: 'timeline13',
        component: 'Timeline',
        events: '/events',
        showDescriptions: false,
      };

      expect(timeline.showDescriptions).toBe(false);
    });

    it('creates a timeline with compact enabled', () => {
      const timeline: TimelineComponent = {
        id: 'timeline14',
        component: 'Timeline',
        events: '/events',
        compact: true,
      };

      expect(timeline.compact).toBe(true);
    });

    it('supports all layouts', () => {
      const layouts: Array<TimelineComponent['layout']> = [
        'default',
        'alternating',
        'grouped',
      ];

      for (const layout of layouts) {
        const timeline: TimelineComponent = {
          id: `timeline-${layout}`,
          component: 'Timeline',
          events: '/events',
          layout,
        };

        expect(timeline.layout).toBe(layout);
      }
    });
  });

  describe('TimelineComponentEvent', () => {
    it('creates an event with all properties', () => {
      const event: TimelineComponentEvent = {
        id: 'event1',
        date: '2024-01-01',
        title: 'Test Event',
        description: 'This is a description',
        icon: '🎉',
        color: '#ff0000',
        group: 'Group A',
        link: 'https://example.com',
      };

      expect(event.id).toBe('event1');
      expect(event.date).toBe('2024-01-01');
      expect(event.title).toBe('Test Event');
      expect(event.description).toBe('This is a description');
      expect(event.icon).toBe('🎉');
      expect(event.color).toBe('#ff0000');
      expect(event.group).toBe('Group A');
      expect(event.link).toBe('https://example.com');
    });

    it('creates an event with only required properties', () => {
      const event: TimelineComponentEvent = {
        date: '2024-01-01',
        title: 'Event Title',
      };

      expect(event.date).toBe('2024-01-01');
      expect(event.title).toBe('Event Title');
      expect(event.id).toBeUndefined();
      expect(event.description).toBeUndefined();
      expect(event.icon).toBeUndefined();
      expect(event.color).toBeUndefined();
      expect(event.group).toBeUndefined();
      expect(event.link).toBeUndefined();
    });

    it('creates an event with id', () => {
      const event: TimelineComponentEvent = {
        id: 'event-id',
        date: '2024-01-01',
        title: 'Event',
      };

      expect(event.id).toBe('event-id');
    });

    it('creates an event with description', () => {
      const event: TimelineComponentEvent = {
        date: '2024-01-01',
        title: 'Event',
        description: 'Long description text',
      };

      expect(event.description).toBe('Long description text');
    });

    it('creates an event with icon', () => {
      const event: TimelineComponentEvent = {
        date: '2024-01-01',
        title: 'Event',
        icon: '📅',
      };

      expect(event.icon).toBe('📅');
    });

    it('creates an event with color', () => {
      const event: TimelineComponentEvent = {
        date: '2024-01-01',
        title: 'Event',
        color: '#00ff00',
      };

      expect(event.color).toBe('#00ff00');
    });

    it('creates an event with group', () => {
      const event: TimelineComponentEvent = {
        date: '2024-01-01',
        title: 'Event',
        group: 'Category A',
      };

      expect(event.group).toBe('Category A');
    });

    it('creates an event with link', () => {
      const event: TimelineComponentEvent = {
        date: '2024-01-01',
        title: 'Event',
        link: 'https://example.com/event',
      };

      expect(event.link).toBe('https://example.com/event');
    });
  });
});
