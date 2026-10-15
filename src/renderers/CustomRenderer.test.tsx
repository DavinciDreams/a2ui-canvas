import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CustomRenderer from './CustomRenderer';

describe('CustomRenderer', () => {
  it('renders with default props', () => {
    const { container } = render(
      <CustomRenderer
        component={{
          id: 'custom1',
          component: 'Custom',
          rendererKey: 'test-renderer',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const custom = container.querySelector('.custom-renderer');
    expect(custom).toBeTruthy();
  });

  it('renders with title', () => {
    const { container } = render(
      <CustomRenderer
        component={{
          id: 'custom2',
          component: 'Custom',
          rendererKey: 'test-renderer',
          title: 'Test Custom',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const title = container.querySelector('h3');
    expect(title).toBeTruthy();
    expect(title!.textContent).toBe('Test Custom');
  });

  it('renders with data', () => {
    const { container } = render(
      <CustomRenderer
        component={{
          id: 'custom3',
          component: 'Custom',
          rendererKey: 'test-renderer',
        }}
        data={{ key: 'value' }}
        theme={undefined}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
    expect(pre!.textContent).toContain('key');
  });

  it('renders with string data', () => {
    const { container } = render(
      <CustomRenderer
        component={{
          id: 'custom4',
          component: 'Custom',
          rendererKey: 'test-renderer',
        }}
        data='String data'
        theme={undefined}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
    expect(pre!.textContent).toBe('String data');
  });

  it('renders with custom theme', () => {
    const { container } = render(
      <CustomRenderer
        component={{
          id: 'custom5',
          component: 'Custom',
          rendererKey: 'test-renderer',
        }}
        data={undefined}
        theme={{
          colors: {
            text: '#ff6b6b',
          },
        }}
      />
    );

    const custom = container.querySelector('.custom-renderer');
    expect(custom).toBeTruthy();
  });

  it('renders without data', () => {
    const { container } = render(
      <CustomRenderer
        component={{
          id: 'custom6',
          component: 'Custom',
          rendererKey: 'test-renderer',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const p = container.querySelector('p');
    expect(p).toBeTruthy();
    expect(p!.textContent).toContain('test-renderer');
  });

  it('renders with legacy content', () => {
    const TestComponent = () => <div>Legacy Component</div>;

    const { container } = render(
      <CustomRenderer
        component={{
          id: 'custom-legacy',
          component: 'Custom',
          rendererKey: 'test-renderer',
        }}
        data={undefined}
        theme={undefined}
        content={{
          component: TestComponent,
          props: { testProp: 'value' },
        }}
      />
    );

    const custom = container.querySelector('.custom-renderer');
    expect(custom).toBeTruthy();
    expect(container.textContent).toContain('Legacy Component');
  });

  it('renders legacy component with props', () => {
    const TestComponent = ({ name }: { name: string }) => <div>Hello, {name}!</div>;

    const { container } = render(
      <CustomRenderer
        component={{
          id: 'custom7',
          component: 'Custom',
          rendererKey: 'test-renderer',
        }}
        data={undefined}
        theme={undefined}
        content={{
          component: TestComponent,
          props: { name: 'World' },
        }}
      />
    );

    const custom = container.querySelector('.custom-renderer');
    expect(custom).toBeTruthy();
    expect(container.textContent).toContain('Hello, World!');
  });

  it('renders with complex data', () => {
    const complexData = {
      nested: {
        object: {
          with: ['array', 'values'],
        },
      },
    };

    const { container } = render(
      <CustomRenderer
        component={{
          id: 'custom8',
          component: 'Custom',
          rendererKey: 'test-renderer',
        }}
        data={complexData}
        theme={undefined}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
    expect(pre!.textContent).toContain('nested');
  });

  it('renders with null data', () => {
    const { container } = render(
      <CustomRenderer
        component={{
          id: 'custom9',
          component: 'Custom',
          rendererKey: 'test-renderer',
        }}
        data={null}
        theme={undefined}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
  });

  it('renders with empty string data', () => {
    const { container } = render(
      <CustomRenderer
        component={{
          id: 'custom10',
          component: 'Custom',
          rendererKey: 'test-renderer',
        }}
        data=''
        theme={undefined}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
  });

  it('renders with array data', () => {
    const arrayData = [1, 2, 3, 4, 5];

    const { container } = render(
      <CustomRenderer
        component={{
          id: 'custom11',
          component: 'Custom',
          rendererKey: 'test-renderer',
        }}
        data={arrayData}
        theme={undefined}
      />
    );

    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
  });

  it('renders with unknown renderer key', () => {
    const { container } = render(
      <CustomRenderer
        component={{
          id: 'custom12',
          component: 'Custom',
          rendererKey: 'unknown-renderer',
        }}
        data={undefined}
        theme={undefined}
      />
    );

    const p = container.querySelector('p');
    expect(p).toBeTruthy();
    expect(p!.textContent).toContain('unknown-renderer');
  });

  it('renders legacy component without props', () => {
    const TestComponent = () => <div>Simple Component</div>;

    const { container } = render(
      <CustomRenderer
        component={{
          id: 'custom13',
          component: 'Custom',
          rendererKey: 'test-renderer',
        }}
        data={undefined}
        theme={undefined}
        content={{
          component: TestComponent,
        }}
      />
    );

    const custom = container.querySelector('.custom-renderer');
    expect(custom).toBeTruthy();
    expect(container.textContent).toContain('Simple Component');
  });
});
