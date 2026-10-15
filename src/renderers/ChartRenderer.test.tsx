import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ChartRenderer from './ChartRenderer';

// Mock optional dependencies
vi.mock('d3', () => ({
  default: null,
}));

vi.mock('shiki', () => ({
  createHighlighter: vi.fn().mockResolvedValue(null),
  codeToHtml: vi.fn(),
}));
import type { ChartComponent } from '../schema/components/chart';

describe('ChartRenderer', () => {
  it('renders with default props', () => {
    const { container } = render(
      <ChartRenderer
        component={{
          id: 'chart1',
          component: 'Chart',
          chartType: 'bar',
          data: '/data',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders with legacy content', () => {
    const { container } = render(
      <ChartRenderer
        component={{
          id: 'chart-legacy',
          component: 'Chart',
          chartType: 'line',
          data: '/data',
        }}
        data={undefined}
        theme={undefined}
        content={{
          data: {
            labels: ['A', 'B', 'C'],
            values: [10, 20, 30],
          },
          options: {
            chartType: 'line',
          },
        }}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders with custom dimensions', () => {
    const { container } = render(
      <ChartRenderer
        component={{
          id: 'chart2',
          component: 'Chart',
          chartType: 'bar',
          data: '/data',
          width: 800,
          height: 400,
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute('width')).toBe('800');
    expect(svg!.getAttribute('height')).toBe('400');
  });

  it('renders with title', () => {
    const { container } = render(
      <ChartRenderer
        component={{
          id: 'chart3',
          component: 'Chart',
          chartType: 'bar',
          data: '/data',
          title: 'Test Chart',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const title = container.querySelector('h3');
    expect(title).toBeTruthy();
    expect(title!.textContent).toBe('Test Chart');
  });

  it('renders with custom colors', () => {
    const { container } = render(
      <ChartRenderer
        component={{
          id: 'chart4',
          component: 'Chart',
          chartType: 'bar',
          data: '/data',
          colors: ['#ff0000', '#00ff00', '#0000ff'],
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
      <ChartRenderer
        component={{
          id: 'chart5',
          component: 'Chart',
          chartType: 'bar',
          data: '/data',
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

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders different chart types', () => {
    const chartTypes: Array<'bar' | 'line' | 'scatter' | 'pie' | 'area' | 'donut' | 'radar' | 'heatmap'> = [
      'bar',
      'line',
      'scatter',
      'pie',
      'area',
      'donut',
      'radar',
      'heatmap',
    ];

    for (const chartType of chartTypes) {
      const { container } = render(
        <ChartRenderer
          component={{
            id: `chart-${chartType}`,
            component: 'Chart',
            chartType,
            data: '/data',
          }}
          data={undefined}
          theme={undefined}
        />
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    }
  });

  it('renders with data array', () => {
    const chartData = [
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
      { label: 'C', value: 30 },
    ];

    const { container } = render(
      <ChartRenderer
        component={{
          id: 'chart6',
          component: 'Chart',
          chartType: 'bar',
          data: '/data',
        }}
        data={chartData}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders empty chart with no data', () => {
    const { container } = render(
      <ChartRenderer
        component={{
          id: 'chart7',
          component: 'Chart',
          chartType: 'bar',
          data: '/data',
        }}
        data={[]}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders with showLegend option', () => {
    const { container } = render(
      <ChartRenderer
        component={{
          id: 'chart8',
          component: 'Chart',
          chartType: 'bar',
          data: '/data',
          showLegend: true,
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders with showGrid option', () => {
    const { container } = render(
      <ChartRenderer
        component={{
          id: 'chart9',
          component: 'Chart',
          chartType: 'bar',
          data: '/data',
          showGrid: true,
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders with threeD option', () => {
    const { container } = render(
      <ChartRenderer
        component={{
          id: 'chart10',
          component: 'Chart',
          chartType: 'bar',
          data: '/data',
          threeD: true,
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders with axis configuration', () => {
    const { container } = render(
      <ChartRenderer
        component={{
          id: 'chart11',
          component: 'Chart',
          chartType: 'bar',
          data: '/data',
          xAxis: {
            label: 'X Axis',
            min: 0,
            max: 100,
          },
          yAxis: {
            label: 'Y Axis',
            min: 0,
            max: 50,
          },
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders with series configuration', () => {
    const { container } = render(
      <ChartRenderer
        component={{
          id: 'chart12',
          component: 'Chart',
          chartType: 'bar',
          data: '/data',
          series: [
            { name: 'Series 1', dataKey: 'value1', type: 'bar' },
            { name: 'Series 2', dataKey: 'value2', type: 'line' },
          ],
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('handles string width and height', () => {
    const { container } = render(
      <ChartRenderer
        component={{
          id: 'chart13',
          component: 'Chart',
          chartType: 'bar',
          data: '/data',
          width: '100%',
          height: '300px',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
