/**
 * Mock setup for sample chord sheets service tests
 */

import { vi } from 'vitest';

/**
 * Setup mocks for environment module
 */
export const setupEnvironmentMocks = () => {
  return vi.mock('../environment', () => ({
    isDevelopmentMode: vi.fn()
  }));
};

/**
 * Setup mocks for data loader module
 */
export const setupDataLoaderMocks = () => {
  return vi.mock('../data-loader', () => ({
    loadSampleData: vi.fn()
  }));
};

/**
 * Setup mocks for logging module
 */
export const setupLoggingMocks = () => {
  return vi.mock('../logging', () => ({
    logSkippingLoad: vi.fn(),
    logLoadingStart: vi.fn(),
    logLoadingSuccess: vi.fn(),
    logLoadingError: vi.fn()
  }));
};
