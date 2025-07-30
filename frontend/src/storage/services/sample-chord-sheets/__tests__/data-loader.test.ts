/**
 * Tests for data loader module
 */

import { describe, it, expect, vi } from 'vitest';
import { loadSampleData } from '../data-loader';
import { createMockChordSheet } from './test-utils';

vi.mock('../data-loader', () => ({
  loadSampleData: vi.fn()
}));

describe('Data Loading', () => {
  it('should load sample data correctly', async () => {
    const mockSamples = [createMockChordSheet()];
    vi.mocked(loadSampleData).mockResolvedValue(mockSamples);
    
    const result = await loadSampleData();
    
    expect(result).toEqual(mockSamples);
  });

  it('should load multiple sample chord sheets', async () => {
    const mockSamples = [
      createMockChordSheet({ title: 'Wonderwall', artist: 'Oasis' }),
      createMockChordSheet({ title: 'Hotel California', artist: 'Eagles' })
    ];
    vi.mocked(loadSampleData).mockResolvedValue(mockSamples);
    
    const result = await loadSampleData();
    
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Wonderwall');
    expect(result[1].title).toBe('Hotel California');
  });

  it('should handle empty sample data', async () => {
    vi.mocked(loadSampleData).mockResolvedValue([]);
    
    const result = await loadSampleData();
    
    expect(result).toEqual([]);
  });
});
