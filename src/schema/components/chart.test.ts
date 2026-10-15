import { describe, it, expect } from 'vitest';
import type { ChartComponent, ChartComponentAxis, ChartComponentSeries } from './chart';

describe('ChartComponent', () => {
  describe('ChartComponent', () => {
    it('creates a minimal chart component', () => {
      const chart: ChartComponent = {
        id: 'chart1',
        component: 'Chart',
        chartType: 'bar',
        data: '/data',
      };

      expect(chart.id).toBe('chart1');
      expect(chart.component).toBe('Chart');
      expect(chart.chartType).toBe('bar');
      expect(chart.data).toBe('/data');
    });

    it('creates a chart with title', () => {
      const chart: ChartComponent = {
        id: 'chart2',
        component: 'Chart',
        chartType: 'line',
        data: '/data',
        title: 'Test Chart',
      };

      expect(chart.title).toBe('Test Chart');
    });

    it('creates a chart with custom dimensions', () => {
      const chart: ChartComponent = {
        id: 'chart3',
        component: 'Chart',
        chartType: 'pie',
        data: '/data',
        width: 800,
        height: 600,
      };

      expect(chart.width).toBe(800);
      expect(chart.height).toBe(600);
    });

    it('creates a chart with string dimensions', () => {
      const chart: ChartComponent = {
        id: 'chart4',
        component: 'Chart',
        chartType: 'area',
        data: '/data',
        width: '100%',
        height: '400px',
      };

      expect(chart.width).toBe('100%');
      expect(chart.height).toBe('400px');
    });

    it('creates a chart with custom colors', () => {
      const chart: ChartComponent = {
        id: 'chart5',
        component: 'Chart',
        chartType: 'donut',
        data: '/data',
        colors: ['#ff0000', '#00ff00', '#0000ff'],
      };

      expect(chart.colors).toEqual(['#ff0000', '#00ff00', '#0000ff']);
    });

    it('creates a chart with axis configuration', () => {
      const xAxis: ChartComponentAxis = {
        label: 'X Axis',
        min: 0,
        max: 100,
        format: '.2f',
      };

      const yAxis: ChartComponentAxis = {
        label: 'Y Axis',
        min: 0,
        max: 50,
      };

      const chart: ChartComponent = {
        id: 'chart6',
        component: 'Chart',
        chartType: 'radar',
        data: '/data',
        xAxis,
        yAxis,
      };

      expect(chart.xAxis).toEqual(xAxis);
      expect(chart.yAxis).toEqual(yAxis);
    });

    it('creates a chart with series configuration', () => {
      const series: ChartComponentSeries[] = [
        {
          name: 'Series 1',
          dataKey: 'value1',
          color: '#ff0000',
          type: 'bar',
        },
        {
          name: 'Series 2',
          dataKey: 'value2',
          color: '#00ff00',
          type: 'line',
        },
      ];

      const chart: ChartComponent = {
        id: 'chart7',
        component: 'Chart',
        chartType: 'bar',
        data: '/data',
        series,
      };

      expect(chart.series).toEqual(series);
    });

    it('creates a chart with 3D enabled', () => {
      const chart: ChartComponent = {
        id: 'chart8',
        component: 'Chart',
        chartType: 'bar',
        data: '/data',
        threeD: true,
      };

      expect(chart.threeD).toBe(true);
    });

    it('creates a chart with legend enabled', () => {
      const chart: ChartComponent = {
        id: 'chart9',
        component: 'Chart',
        chartType: 'line',
        data: '/data',
        showLegend: true,
      };

      expect(chart.showLegend).toBe(true);
    });

    it('creates a chart with grid enabled', () => {
      const chart: ChartComponent = {
        id: 'chart10',
        component: 'Chart',
        chartType: 'scatter',
        data: '/data',
        showGrid: true,
      };

      expect(chart.showGrid).toBe(true);
    });

    it('supports all chart types', () => {
      const chartTypes: Array<ChartComponent['chartType']> = [
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
        const chart: ChartComponent = {
          id: `chart-${chartType}`,
          component: 'Chart',
          chartType,
          data: '/data',
        };

        expect(chart.chartType).toBe(chartType);
      }
    });
  });

  describe('ChartComponentAxis', () => {
    it('creates an axis with all properties', () => {
      const axis: ChartComponentAxis = {
        label: 'Test Axis',
        min: 0,
        max: 100,
        format: '.2f',
      };

      expect(axis.label).toBe('Test Axis');
      expect(axis.min).toBe(0);
      expect(axis.max).toBe(100);
      expect(axis.format).toBe('.2f');
    });

    it('creates an axis with only label', () => {
      const axis: ChartComponentAxis = {
        label: 'Axis Label',
      };

      expect(axis.label).toBe('Axis Label');
      expect(axis.min).toBeUndefined();
      expect(axis.max).toBeUndefined();
      expect(axis.format).toBeUndefined();
    });

    it('creates an axis with min and max', () => {
      const axis: ChartComponentAxis = {
        min: -10,
        max: 10,
      };

      expect(axis.min).toBe(-10);
      expect(axis.max).toBe(10);
    });
  });

  describe('ChartComponentSeries', () => {
    it('creates a series with all properties', () => {
      const series: ChartComponentSeries = {
        name: 'Test Series',
        dataKey: 'value',
        color: '#ff0000',
        type: 'bar',
      };

      expect(series.name).toBe('Test Series');
      expect(series.dataKey).toBe('value');
      expect(series.color).toBe('#ff0000');
      expect(series.type).toBe('bar');
    });

    it('creates a series with only required properties', () => {
      const series: ChartComponentSeries = {
        name: 'Series',
        dataKey: 'data',
      };

      expect(series.name).toBe('Series');
      expect(series.dataKey).toBe('data');
      expect(series.color).toBeUndefined();
      expect(series.type).toBeUndefined();
    });

    it('supports all series types', () => {
      const seriesTypes: Array<ChartComponentSeries['type']> = ['bar', 'line', 'area'];

      for (const type of seriesTypes) {
        const series: ChartComponentSeries = {
          name: `Series ${type}`,
          dataKey: 'value',
          type,
        };

        expect(series.type).toBe(type);
      }
    });
  });
});
