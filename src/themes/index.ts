/**
 * Theme system exports
 */

import type { Theme, ThemeColors, ThemeSpacing, ThemeTypography, ThemeBorderRadius, ThemeShadows } from '../types';
import { defaultTheme } from './defaultTheme';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

export type { ThemeContextType } from './types';
export { defaultTheme, lightTheme, darkTheme };
export type { Theme } from '../types';

/**
 * Theme utilities
 */

/**
 * Deep merge two themes, with the second theme taking precedence
 */
export function mergeThemes(base: Theme, override: Partial<Theme>): Theme {
  return {
    colors: { ...base.colors, ...override.colors },
    spacing: { ...base.spacing, ...override.spacing },
    typography: {
      font: override.typography?.font ?? base.typography.font,
      sizes: { ...base.typography.sizes, ...override.typography?.sizes },
      weights: { ...base.typography.weights, ...override.typography?.weights },
    },
    borderRadius: { ...base.borderRadius, ...override.borderRadius },
    shadows: { ...base.shadows, ...override.shadows },
  };
}

/**
 * Validate that a theme has all required properties
 */
export function validateTheme(theme: unknown): theme is Theme {
  if (!theme || typeof theme !== 'object') return false;

  const t = theme as any;
  
  // Check colors
  if (!t.colors || typeof t.colors !== 'object') return false;
  const requiredColors: (keyof ThemeColors)[] = [
    'background', 'surface', 'primary', 'secondary', 'text', 'muted', 'border', 'highlight'
  ];
  for (const color of requiredColors) {
    if (!t.colors[color] || typeof t.colors[color] !== 'string') return false;
  }

  // Check spacing
  if (!t.spacing || typeof t.spacing !== 'object') return false;
  const requiredSpacing: (keyof ThemeSpacing)[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  for (const space of requiredSpacing) {
    if (!t.spacing[space] || typeof t.spacing[space] !== 'string') return false;
  }

  // Check typography
  if (!t.typography || typeof t.typography !== 'object') return false;
  if (!t.typography.font || typeof t.typography.font !== 'string') return false;
  if (!t.typography.sizes || typeof t.typography.sizes !== 'object') return false;
  if (!t.typography.weights || typeof t.typography.weights !== 'object') return false;
  
  const requiredSizes: (keyof ThemeTypography['sizes'])[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  for (const size of requiredSizes) {
    if (!t.typography.sizes[size] || typeof t.typography.sizes[size] !== 'string') return false;
  }
  
  const requiredWeights: (keyof ThemeTypography['weights'])[] = ['normal', 'medium', 'bold'];
  for (const weight of requiredWeights) {
    if (typeof t.typography.weights[weight] !== 'number') return false;
  }

  // Check border radius
  if (!t.borderRadius || typeof t.borderRadius !== 'object') return false;
  const requiredRadius: (keyof ThemeBorderRadius)[] = ['sm', 'md', 'lg', 'xl'];
  for (const radius of requiredRadius) {
    if (!t.borderRadius[radius] || typeof t.borderRadius[radius] !== 'string') return false;
  }

  // Check shadows
  if (!t.shadows || typeof t.shadows !== 'object') return false;
  const requiredShadows: (keyof ThemeShadows)[] = ['sm', 'md', 'lg'];
  for (const shadow of requiredShadows) {
    if (!t.shadows[shadow] || typeof t.shadows[shadow] !== 'string') return false;
  }

  return true;
}

/**
 * Create a theme preset with custom accent color
 */
export function createAccentTheme(base: Theme, accentColor: string): Theme {
  return mergeThemes(base, {
    colors: {
      ...base.colors,
      primary: accentColor,
      secondary: adjustColor(accentColor, -20),
    },
  });
}

/**
 * Create a high contrast theme
 */
export function createHighContrastTheme(base: Theme): Theme {
  return mergeThemes(base, {
    colors: {
      ...base.colors,
      text: '#000000',
      background: '#ffffff',
      surface: '#f8f8f8',
      border: '#333333',
      muted: '#666666',
    },
  });
}

/**
 * Create a dark theme from a light theme
 */
export function createDarkTheme(base: Theme): Theme {
  return mergeThemes(base, {
    colors: {
      ...base.colors,
      background: '#1a1a1a',
      surface: '#2d2d2d',
      text: '#ffffff',
      muted: '#a0a0a0',
      border: '#404040',
      highlight: '#333333',
    },
  });
}

/**
 * Adjust color brightness
 */
function adjustColor(color: string, amount: number): string {
  // Simple color adjustment - in a real implementation you might use a more sophisticated approach
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Theme presets for common use cases
 */
export const themePresets = {
  /**
   * Blue accent theme
   */
  blue: createAccentTheme(defaultTheme, '#0066cc'),
  
  /**
   * Green accent theme
   */
  green: createAccentTheme(defaultTheme, '#008800'),
  
  /**
   * Red accent theme
   */
  red: createAccentTheme(defaultTheme, '#cc0000'),
  
  /**
   * Purple accent theme
   */
  purple: createAccentTheme(defaultTheme, '#8800cc'),
  
  /**
   * High contrast light theme
   */
  highContrastLight: createHighContrastTheme(defaultTheme),
  
  /**
   * High contrast dark theme
   */
  highContrastDark: createHighContrastTheme(darkTheme),
};

/**
 * Get theme by name
 */
export function getThemePreset(name: keyof typeof themePresets): Theme {
  return themePresets[name];
}

/**
 * Get all available theme preset names
 */
export function getThemePresetNames(): (keyof typeof themePresets)[] {
  return Object.keys(themePresets) as (keyof typeof themePresets)[];
}
