/**
 * Test setup file for Vitest
 */

import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock console methods to reduce noise in tests
globalThis.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: console.log,
};
