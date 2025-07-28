/**
 * Test utilities and mocks for sample songs service
 */

import { vi } from 'vitest';
import type { ChordSheet } from '@chordium/types';
import type { IChordSheetStorageService } from '../types';

/**
 * Create a mock ChordSheet for testing
 */
export const createMockChordSheet = (overrides: Partial<ChordSheet> = {}): ChordSheet => ({
  title: 'Test Song',
  artist: 'Test Artist',
  songChords: '[Verse]\nC G Am F',
  songKey: 'C',
  guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  guitarCapo: 0,
  ...overrides
});

/**
 * Create a mock chord sheet storage service
 */
export const createMockChordSheetService = (): IChordSheetStorageService => ({
  getAllSaved: vi.fn(),
  store: vi.fn()
});
