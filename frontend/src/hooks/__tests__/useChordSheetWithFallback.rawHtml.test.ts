import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MORE_THAN_WORDS_RAW_HTML } from '../../components/ChordDisplay/__tests__/__fixtures__/more-than-words';

// Hoist all mock functions so vi.mock factories can reference them.
// vitest config has mockReset:true so implementations must be re-set in beforeEach.
const { mockFetchSong, mockGetMetadata, mockGetContent, mockStoreChordSheet } = vi.hoisted(() => ({
  mockFetchSong: vi.fn(),
  mockGetMetadata: vi.fn(),
  mockGetContent: vi.fn(),
  mockStoreChordSheet: vi.fn(),
}));

vi.mock('@/storage/stores/chord-sheets/operations', () => ({
  getChordSheetMetadata: mockGetMetadata,
  getChordSheetContent: mockGetContent,
  storeChordSheet: mockStoreChordSheet,
}));

vi.mock('@/services/api/fetch-song', () => ({
  fetchSongFromAPI: mockFetchSong,
}));

describe('useChordSheetWithFallback – rawHtml passthrough', () => {
  beforeEach(() => {
    mockGetMetadata.mockResolvedValue(null);
    mockGetContent.mockResolvedValue(null);
    mockStoreChordSheet.mockReturnValue(Promise.resolve());
    mockFetchSong.mockResolvedValue({
      title: 'More Than Words',
      artist: 'Extreme',
      songKey: 'G',
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
      guitarCapo: 0,
      songChords: 'plain text fallback',
      rawHtml: MORE_THAN_WORDS_RAW_HTML,
    });
  });

  it('exposes rawHtml on content after API fetch', async () => {
    const { useChordSheetWithFallback } = await import('../useChordSheetWithFallback');
    const { result } = renderHook(() => useChordSheetWithFallback('extreme/more-than-words'));

    await act(async () => { await result.current.loadFromAPI(); });
    await waitFor(() => expect(result.current.content).not.toBeNull(), { timeout: 3000 });

    expect(result.current.content?.rawHtml).toBe(MORE_THAN_WORDS_RAW_HTML);
  });

  it('exposes rawHtml on chordSheet after API fetch', async () => {
    const { useChordSheetWithFallback } = await import('../useChordSheetWithFallback');
    const { result } = renderHook(() => useChordSheetWithFallback('extreme/more-than-words'));

    await act(async () => { await result.current.loadFromAPI(); });
    await waitFor(() => expect(result.current.chordSheet).not.toBeNull(), { timeout: 3000 });

    expect(result.current.chordSheet?.rawHtml).toBe(MORE_THAN_WORDS_RAW_HTML);
  });

  it('does not drop songChords when rawHtml is also present', async () => {
    const { useChordSheetWithFallback } = await import('../useChordSheetWithFallback');
    const { result } = renderHook(() => useChordSheetWithFallback('extreme/more-than-words'));

    await act(async () => { await result.current.loadFromAPI(); });
    await waitFor(() => expect(result.current.content).not.toBeNull(), { timeout: 3000 });

    expect(result.current.content?.songChords).toBe('plain text fallback');
    expect(result.current.content?.rawHtml).toBe(MORE_THAN_WORDS_RAW_HTML);
  });
});
