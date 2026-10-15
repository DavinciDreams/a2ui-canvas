import { describe, it, expect } from 'vitest';
import type { CustomComponent } from './custom';

describe('CustomComponent', () => {
  it('creates a minimal custom component', () => {
    const custom: CustomComponent = {
      id: 'custom1',
      component: 'Custom',
      rendererKey: 'myCustomRenderer',
    };

    expect(custom.id).toBe('custom1');
    expect(custom.component).toBe('Custom');
    expect(custom.rendererKey).toBe('myCustomRenderer');
  });

  it('creates a custom component with title', () => {
    const custom: CustomComponent = {
      id: 'custom2',
      component: 'Custom',
      rendererKey: 'chartRenderer',
      title: 'My Custom Chart',
    };

    expect(custom.title).toBe('My Custom Chart');
  });

  it('creates a custom component with props', () => {
    const props = {
      data: [1, 2, 3, 4, 5],
      type: 'bar',
      colors: ['#ff0000', '#00ff00', '#0000ff'],
    };

    const custom: CustomComponent = {
      id: 'custom3',
      component: 'Custom',
      rendererKey: 'customChart',
      props,
    };

    expect(custom.props).toEqual(props);
  });

  it('creates a custom component with complex props', () => {
    const complexProps = {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://example.com/avatar.jpg',
      },
      settings: {
        theme: 'dark',
        notifications: true,
        privacy: {
          showEmail: false,
          showPhone: true,
        },
      },
      tags: ['developer', 'javascript', 'react'],
    };

    const custom: CustomComponent = {
      id: 'custom4',
      component: 'Custom',
      rendererKey: 'userProfile',
      title: 'User Profile',
      props: complexProps,
    };

    expect(custom.props).toEqual(complexProps);
    expect(custom.title).toBe('User Profile');
  });

  it('creates a custom component with array props', () => {
    const arrayProps = {
      items: [
        { id: 1, name: 'Item 1', active: true },
        { id: 2, name: 'Item 2', active: false },
        { id: 3, name: 'Item 3', active: true },
      ],
      selectedItems: [1, 3],
    };

    const custom: CustomComponent = {
      id: 'custom5',
      component: 'Custom',
      rendererKey: 'itemList',
      props: arrayProps,
    };

    expect(custom.props).toEqual(arrayProps);
  });

  it('creates a custom component with function props (serialized)', () => {
    // In practice, functions would be serialized as strings or references
    const functionProps = {
      onClick: 'handleItemClick',
      onChange: 'handleInputChange',
      validator: 'validateForm',
    };

    const custom: CustomComponent = {
      id: 'custom6',
      component: 'Custom',
      rendererKey: 'interactiveForm',
      props: functionProps,
    };

    expect(custom.props).toEqual(functionProps);
  });

  it('creates a custom component with all properties', () => {
    const allProps = {
      title: 'Dashboard Widget',
      config: {
        refreshInterval: 5000,
        showHeader: true,
        allowResize: false,
      },
      data: {
        metrics: [
          { name: 'Users', value: 1234, trend: 'up' },
          { name: 'Revenue', value: 5678, trend: 'down' },
        ],
        lastUpdated: '2023-01-01T00:00:00Z',
      },
    };

    const custom: CustomComponent = {
      id: 'custom7',
      component: 'Custom',
      rendererKey: 'dashboardWidget',
      title: 'Analytics Dashboard',
      props: allProps,
    };

    expect(custom.id).toBe('custom7');
    expect(custom.component).toBe('Custom');
    expect(custom.rendererKey).toBe('dashboardWidget');
    expect(custom.title).toBe('Analytics Dashboard');
    expect(custom.props).toEqual(allProps);
  });

  it('handles empty props', () => {
    const custom: CustomComponent = {
      id: 'custom8',
      component: 'Custom',
      rendererKey: 'emptyComponent',
      props: {},
    };

    expect(custom.props).toEqual({});
  });

  it('handles undefined props', () => {
    const custom: CustomComponent = {
      id: 'custom9',
      component: 'Custom',
      rendererKey: 'simpleComponent',
    };

    expect(custom.props).toBeUndefined();
  });

  it('handles null props', () => {
    const custom: CustomComponent = {
      id: 'custom10',
      component: 'Custom',
      rendererKey: 'nullPropsComponent',
      props: null as any,
    };

    expect(custom.props).toBeNull();
  });
});
