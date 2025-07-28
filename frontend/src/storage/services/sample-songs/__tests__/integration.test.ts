/**
 * Integration tests for SampleSongsService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SampleSongsService, isDevelopmentMode, loadSampleData } from '../index';
import { createMockChordSheetService, createMockChordSheet } from './test-utils';

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

describe('SampleSongsService Integration', () => {
  let mockChordSheetService: ReturnType<typeof createMockChordSheetService>;
  let sampleSongsService: SampleSongsService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockChordSheetService = createMockChordSheetService();
    sampleSongsService = new SampleSongsService(mockChordSheetService);
  });

  it('should not load samples in production mode', async () => {
    vi.mocked(isDevelopmentMode).mockReturnValue(false);
    
    await sampleSongsService.loadSampleSongs();
    
    expect(mockChordSheetService.getAllSaved).not.toHaveBeenCalled();
    expect(mockChordSheetService.store).not.toHaveBeenCalled();
  });

  it('should not load samples when user has existing data', async () => {
    const mockChordSheet = createMockChordSheet();
    
    vi.mocked(isDevelopmentMode).mockReturnValue(true);
    vi.mocked(mockChordSheetService.getAllSaved).mockResolvedValue([mockChordSheet]);
    
    await sampleSongsService.loadSampleSongs();
    
    expect(mockChordSheetService.getAllSaved).toHaveBeenCalledOnce();
    expect(mockChordSheetService.store).not.toHaveBeenCalled();
  });

  it('should load samples in dev mode when no existing data', async () => {
    const mockSamples = [createMockChordSheet()];
    
    vi.mocked(isDevelopmentMode).mockReturnValue(true);
    vi.mocked(mockChordSheetService.getAllSaved).mockResolvedValue([]);
    vi.mocked(loadSampleData).mockResolvedValue(mockSamples);
    
    await sampleSongsService.loadSampleSongs();
    
    expect(mockChordSheetService.getAllSaved).toHaveBeenCalledOnce();
    expect(loadSampleData).toHaveBeenCalledOnce();
    expect(mockChordSheetService.store).toHaveBeenCalledWith(
      mockSamples[0].artist,
      mockSamples[0].title,
      mockSamples[0],
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

  it('should handle storage errors gracefully', async () => {
    const mockSamples = [createMockChordSheet()];
    
    vi.mocked(isDevelopmentMode).mockReturnValue(true);
    vi.mocked(mockChordSheetService.getAllSaved).mockResolvedValue([]);
    vi.mocked(loadSampleData).mockResolvedValue(mockSamples);
    vi.mocked(mockChordSheetService.store).mockRejectedValue(new Error('Storage error'));
    
    // Should not throw
    await expect(sampleSongsService.loadSampleSongs()).resolves.toBeUndefined();
  });
});
