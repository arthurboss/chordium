import { jest } from "@jest/globals";
import express from 'express';
import request from 'supertest';

// Import fixtures
import { BackendFixtureLoader } from "../../fixture-loader.js";

/**
 * Shared setup utilities for search controller tests
 */

// Initialize fixture loader
export const fixtureLoader = new BackendFixtureLoader();

// Mock clients and services
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockSupabaseClient: any = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ilike: (jest.fn() as any).mockResolvedValue({ data: [], error: null })
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockCifraClubService: any = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  search: (jest.fn() as any).mockResolvedValue([]),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getArtistSongs: (jest.fn() as any).mockResolvedValue([]),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getChordSheet: (jest.fn() as any).mockResolvedValue(''),
  baseUrl: 'https://www.cifraclub.com.br'
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockS3StorageService: any = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getArtistSongs: (jest.fn() as any).mockResolvedValue(null),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storeArtistSongs: (jest.fn() as any).mockResolvedValue(true),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveArtistSongs: (jest.fn() as any).mockResolvedValue(true),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveChordSheet: (jest.fn() as any).mockResolvedValue(true),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getChordSheet: (jest.fn() as any).mockResolvedValue(null)
};

// Global app and server variables - using module-level variables
export const appState = { app: null as express.Application | null };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const serverState = { server: null as any };

/**
 * Setup Express app with mocked services
 */
export const setupExpressApp = async (): Promise<void> => {
  // Mock the modules
  jest.unstable_mockModule('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => mockSupabaseClient)
  }));

  jest.unstable_mockModule('../../../config/config.js', () => ({
    __esModule: true,
    default: {
      supabase: {
        url: 'http://localhost:54321/mock',
        serviceRoleKey: 'dummy-key'
      }
    }
  }));

  jest.unstable_mockModule('../../../services/cifraclub.service.js', () => ({
    __esModule: true,
    default: mockCifraClubService
  }));

  jest.unstable_mockModule('../../../services/s3-storage.service.js', () => ({
    s3StorageService: mockS3StorageService
  }));

  // Import the router after setting up the mocks
  const routerModule = await import('../../../routes/api.js');
  const searchRouter = routerModule.default;
  
  // Setup Express app
  appState.app = express();
  appState.app.use(express.json());
  appState.app.use('/api', searchRouter);
};

/**
 * Start the test server
 */
export const startTestServer = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!appState.app) {
      throw new Error('App not initialized. Call setupExpressApp first.');
    }
    serverState.server = appState.app.listen(0, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).agent = request.agent(serverState.server);
      resolve();
    });
  });
};

/**
 * Close the test server
 */
export const closeTestServer = (): Promise<void> => {
  return new Promise((resolve) => {
    if (serverState.server) {
      serverState.server.close(resolve);
    } else {
      resolve();
    }
  });
};

/**
 * Reset all mocks to default state
 */
export const resetAllMocks = (): void => {
  jest.clearAllMocks();
  
  // Reset default mock implementations
  mockSupabaseClient.from.mockReturnThis();
  mockSupabaseClient.select.mockReturnThis();
  mockSupabaseClient.ilike.mockResolvedValue({ data: [], error: null });
  
  // Reset CifraClub service mocks
  mockCifraClubService.search.mockResolvedValue([]);
  mockCifraClubService.getArtistSongs.mockResolvedValue([]);
  mockCifraClubService.getChordSheet.mockResolvedValue('');
  
  // Reset S3 service mocks - return null to simulate cache miss
  mockS3StorageService.getArtistSongs.mockResolvedValue(null);
  mockS3StorageService.getChordSheet.mockResolvedValue(null);
};
