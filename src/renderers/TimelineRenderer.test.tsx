import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TimelineRenderer from './TimelineRenderer';

describe('TimelineRenderer', () => {
  it('renders with default props', () => {
    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline1',
          component: 'Timeline',
          events: '/events',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const timeline = container.querySelector('div');
    expect(timeline).toBeTruthy();
  });

  it('renders with events data', () => {
    const events = [
      { id: '1', title: 'Event 1', date: '2024-01-01' },
      { id: '2', title: 'Event 2', date: '2024-01-02' },
      { id: '3', title: 'Event 3', date: '2024-01-03' },
    ];

    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline2',
          component: 'Timeline',
          events: '/events',
        }}
        data={events}
        theme={undefined}
      />
    );

    const timeline = container.querySelector('div');
    expect(timeline).toBeTruthy();
  });

  it('renders with legacy content', () => {
    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline-legacy',
          component: 'Timeline',
          events: '/events',
        }}
        data={undefined}
        theme={undefined}
        content={{
          events: [
            { id: '1', title: 'Event 1', date: '2024-01-01' },
          ],
          options: {
            orientation: 'vertical',
          },
        }}
      />
    );

    const timeline = container.querySelector('div');
    expect(timeline).toBeTruthy();
  });

  it('renders with title', () => {
    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline3',
          component: 'Timeline',
          events: '/events',
          title: 'Test Timeline',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const title = container.querySelector('h3');
    expect(title).toBeTruthy();
    expect(title!.textContent).toBe('Test Timeline');
  });

  it('renders with vertical orientation', () => {
    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline4',
          component: 'Timeline',
          events: '/events',
          orientation: 'vertical',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const timeline = container.querySelector('div');
    expect(timeline).toBeTruthy();
  });

  it('renders with horizontal orientation', () => {
    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline5',
          component: 'Timeline',
          events: '/events',
          orientation: 'horizontal',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const timeline = container.querySelector('div');
    expect(timeline).toBeTruthy();
  });

  it('renders with alternating layout', () => {
    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline6',
          component: 'Timeline',
          events: '/events',
          layout: 'alternating',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const timeline = container.querySelector('div');
    expect(timeline).toBeTruthy();
  });

  it('renders with grouped layout', () => {
    const events = [
      { id: '1', title: 'Event 1', date: '2024-01-01', group: 'Group A' },
      { id: '2', title: 'Event 2', date: '2024-01-02', group: 'Group B' },
      { id: '3', title: 'Event 3', date: '2024-01-03', group: 'Group A' },
    ];

    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline7',
          component: 'Timeline',
          events: '/events',
          layout: 'grouped',
        }}
        data={events}
        theme={undefined}
      />
    );

    const timeline = container.querySelector('div');
    expect(timeline).toBeTruthy();
  });

  it('renders with groupBy option', () => {
    const events = [
      { id: '1', title: 'Event 1', date: '2024-01-01', category: 'Category A' },
      { id: '2', title: 'Event 2', date: '2024-01-02', category: 'Category B' },
    ];

    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline8',
          component: 'Timeline',
          events: '/events',
          groupBy: 'category',
        }}
        data={events}
        theme={undefined}
      />
    );

    const timeline = container.querySelector('div');
    expect(timeline).toBeTruthy();
  });

  it('renders with showDates option', () => {
    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline9',
          component: 'Timeline',
          events: '/events',
          showDates: true,
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const timeline = container.querySelector('div');
    expect(timeline).toBeTruthy();
  });

  it('renders with showDescriptions option', () => {
    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline10',
          component: 'Timeline',
          events: '/events',
          showDescriptions: true,
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const timeline = container.querySelector('div');
    expect(timeline).toBeTruthy();
  });

  it('renders with custom theme', () => {
    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline11',
          component: 'Timeline',
          events: '/events',
        }}
        data={undefined}
        theme={{
          colors: {
            primary: '#ff6b6b',
            text: '#1a1a1a',
            muted: '#888888',
            border: '#dddddd',
          },
        }}
      />
    );

    const timeline = container.querySelector('div');
    expect(timeline).toBeTruthy();
  });

  it('renders events with colors', () => {
    const events = [
      { id: '1', title: 'Event 1', date: '2024-01-01', color: '#ff0000' },
      { id: '2', title: 'Event 2', date: '2024-01-02', color: '#00ff00' },
    ];

    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline12',
          component: 'Timeline',
          events: '/events',
        }}
        data={events}
        theme={undefined}
      />
    );

    const timeline = container.querySelector('div');
    expect(timeline).toBeTruthy();
  });

  it('renders empty timeline with no events', () => {
    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline13',
          component: 'Timeline',
          events: '/events',
        }}
        data={[]}
        theme={undefined}
      />
    );

    const timeline = container.querySelector('div');
    expect(timeline).toBeTruthy();
  });

  it('renders events with descriptions', () => {
    const events = [
      {
        id: '1',
        title: 'Event 1',
        date: '2024-01-01',
        description: 'This is a description',
      },
    ];

    const { container } = render(
      <TimelineRenderer
        component={{
          id: 'timeline14',
          component: 'Timeline',
          events: '/events',
        }}
        data={events}
        theme={undefined}
      />
    );

    const timeline = container.querySelector('div');
    expect(timeline).toBeTruthy();
  });
});
