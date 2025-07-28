/**
 * Tests for sample songs service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ChordSheet } from '@chordium/types';
import { 
  SampleSongsService, 
  type IChordSheetStorageService,
  isDevelopmentMode,
  shouldLoadSamples,
  loadSampleData,
  storeSampleSongs
} from '../index';

// Mock environment
vi.mock('../environment', () => ({
  isDevelopmentMode: vi.fn()
}));

// Mock data loader
vi.mock('../data-loader', () => ({
  loadSampleData: vi.fn()
}));

// Mock logging to avoid console spam in tests
vi.mock('../logging', () => ({
  logSkippingLoad: vi.fn(),
  logLoadingStart: vi.fn(),
  logLoadingSuccess: vi.fn(),
  logLoadingError: vi.fn()
}));

describe('Sample Songs Service', () => {
  let mockChordSheetService: IChordSheetStorageService;
  let sampleSongsService: SampleSongsService;

  const mockChordSheet: ChordSheet = {
    title: 'Test Song',
    artist: 'Test Artist',
    songChords: '[Verse]\nC G Am F',
    songKey: 'C',
    guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    guitarCapo: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockChordSheetService = {
      getAllSaved: vi.fn(),
      store: vi.fn()
    };
    
    sampleSongsService = new SampleSongsService(mockChordSheetService);
  });

  describe('Environment Detection', () => {
    it('should detect development mode correctly', () => {
      const mockIsDev = vi.mocked(isDevelopmentMode);
      mockIsDev.mockReturnValue(true);
      
      expect(isDevelopmentMode()).toBe(true);
    });
  });

  describe('Duplicate Prevention', () => {
    it('should return true when no saved chord sheets exist', async () => {
      vi.mocked(mockChordSheetService.getAllSaved).mockResolvedValue([]);
      
      const result = await shouldLoadSamples(mockChordSheetService);
      
      expect(result).toBe(true);
      expect(mockChordSheetService.getAllSaved).toHaveBeenCalledOnce();
    });

    it('should return false when saved chord sheets exist', async () => {
      vi.mocked(mockChordSheetService.getAllSaved).mockResolvedValue([mockChordSheet]);
      
      const result = await shouldLoadSamples(mockChordSheetService);
      
      expect(result).toBe(false);
      expect(mockChordSheetService.getAllSaved).toHaveBeenCalledOnce();
    });
  });

  describe('Data Loading', () => {
    it('should load sample data correctly', async () => {
      const mockSamples = [mockChordSheet];
      vi.mocked(loadSampleData).mockResolvedValue(mockSamples);
      
      const result = await loadSampleData();
      
      expect(result).toEqual(mockSamples);
    });
  });

  describe('Sample Storage', () => {
    it('should store samples with correct metadata', async () => {
      const samples = [mockChordSheet];
      
      await storeSampleSongs(samples, mockChordSheetService);
      
      expect(mockChordSheetService.store).toHaveBeenCalledWith(
        mockChordSheet.artist,
        mockChordSheet.title,
        mockChordSheet,
        { saved: true, source: 'sample-dev' }
      );
    });
  });

  describe('SampleSongsService Integration', () => {
    it('should not load samples in production mode', async () => {
      vi.mocked(isDevelopmentMode).mockReturnValue(false);
      
      await sampleSongsService.loadSampleSongs();
      
      expect(mockChordSheetService.getAllSaved).not.toHaveBeenCalled();
      expect(mockChordSheetService.store).not.toHaveBeenCalled();
    });

    it('should not load samples when user has existing data', async () => {
      vi.mocked(isDevelopmentMode).mockReturnValue(true);
      vi.mocked(mockChordSheetService.getAllSaved).mockResolvedValue([mockChordSheet]);
      
      await sampleSongsService.loadSampleSongs();
      
      expect(mockChordSheetService.getAllSaved).toHaveBeenCalledOnce();
      expect(mockChordSheetService.store).not.toHaveBeenCalled();
    });

    it('should load samples in dev mode when no existing data', async () => {
      const mockSamples = [mockChordSheet];
      
      vi.mocked(isDevelopmentMode).mockReturnValue(true);
      vi.mocked(mockChordSheetService.getAllSaved).mockResolvedValue([]);
      vi.mocked(loadSampleData).mockResolvedValue(mockSamples);
      
      await sampleSongsService.loadSampleSongs();
      
      expect(mockChordSheetService.getAllSaved).toHaveBeenCalledOnce();
      expect(loadSampleData).toHaveBeenCalledOnce();
      expect(mockChordSheetService.store).toHaveBeenCalledWith(
        mockChordSheet.artist,
        mockChordSheet.title,
        mockChordSheet,
        { saved: true, source: 'sample-dev' }
      );
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(isDevelopmentMode).mockReturnValue(true);
      vi.mocked(mockChordSheetService.getAllSaved).mockResolvedValue([]);
      vi.mocked(loadSampleData).mockRejectedValue(new Error('Test error'));
      
      // Should not throw
      await expect(sampleSongsService.loadSampleSongs()).resolves.toBeUndefined();
    });
  });
});
