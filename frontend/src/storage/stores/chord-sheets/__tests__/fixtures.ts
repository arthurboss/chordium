/**
 * Test fixtures for chord sheet storage tests
 * 
 * Provides reusable test data from shared fixtures to ensure consistency
 * across tests and avoid code duplication. Uses actual fixture data
 * from the shared fixtures directory.
 */

import type { ChordSheet, Song } from '@chordium/types';
import wonderwallFixture from '@/../../shared/fixtures/chord-sheet/oasis-wonderwall.json';
import hotelCaliforniaFixture from '@/../../shared/fixtures/chord-sheet/eagles-hotel_california.json';

/**
 * Sample chord sheet from Oasis - Wonderwall fixture
 * Used for testing chord sheet storage operations
 */
export const sampleChordSheet: ChordSheet = wonderwallFixture as ChordSheet;

/**
 * Sample Song object matching the Wonderwall chord sheet
 * Follows Song.path format for testing storage key consistency
 */
export const sampleSong: Song = {
  path: 'oasis/wonderwall',
  title: 'Wonderwall',
  artist: 'Oasis'
};

/**
 * Array of multiple chord sheets for testing bulk operations
 */
export const multipleChordSheets: ChordSheet[] = [
  wonderwallFixture as ChordSheet,
  hotelCaliforniaFixture as ChordSheet
];

/**
 * Array of corresponding Song objects for testing
 */
export const multipleSongs: Song[] = [
  { path: 'oasis/wonderwall', title: 'Wonderwall', artist: 'Oasis' },
  { path: 'eagles/hotel-california', title: 'Hotel California', artist: 'Eagles' }
];
