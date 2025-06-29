import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavigationUtils } from '../navigation-utils';

// Mock dependencies
const mockNavigate = vi.fn();

describe('NavigationUtils', () => {
  let navigationUtils: NavigationUtils;

  beforeEach(() => {
    vi.clearAllMocks();
    navigationUtils = new NavigationUtils();
  });

  describe('updateUrlIfNeeded', () => {
    it('should not navigate if current params match data slugs', () => {
      const data = { artist: 'Eagles', song: 'Hotel California' };
      const currentParams = { artist: 'eagles', song: 'hotel-california' };
      
      const shouldUpdate = navigationUtils.shouldUpdateUrl(data, currentParams);
      
      expect(shouldUpdate).toBe(false);
    });

    it('should navigate when artist slug differs', () => {
      const data = { artist: 'The Beatles', song: 'Hey Jude' };
      const currentParams = { artist: 'beatles', song: 'hey-jude' };
      
      const shouldUpdate = navigationUtils.shouldUpdateUrl(data, currentParams);
      
      expect(shouldUpdate).toBe(true);
    });

    it('should navigate when song slug differs', () => {
      const data = { artist: 'Eagles', song: 'Hotel California' };
      const currentParams = { artist: 'eagles', song: 'hotel-cal' };
      
      const shouldUpdate = navigationUtils.shouldUpdateUrl(data, currentParams);
      
      expect(shouldUpdate).toBe(true);
    });

    it('should generate correct My Chord Sheets path', () => {
      const data = { artist: 'The Beatles', song: 'Hey Jude' };
      
      const path = navigationUtils.generateNavigationPath(data, true);
      
      expect(path).toBe('/my-chord-sheets/the-beatles/hey-jude');
    });

    it('should generate correct search context path', () => {
      const data = { artist: 'Eagles', song: 'Hotel California' };
      
      const path = navigationUtils.generateNavigationPath(data, false);
      
      expect(path).toBe('/eagles/hotel-california');
    });

    it('should detect My Chord Sheets context from path', () => {
      const isMyChordSheets = navigationUtils.isMyChordSheetsContext('/my-chord-sheets/eagles/hotel-california');
      
      expect(isMyChordSheets).toBe(true);
    });

    it('should detect search context from path', () => {
      const isMyChordSheets = navigationUtils.isMyChordSheetsContext('/eagles/hotel-california');
      
      expect(isMyChordSheets).toBe(false);
    });

    it('should handle special characters in artist/song names', () => {
      const data = { artist: "Guns N' Roses", song: "Sweet Child O' Mine" };
      
      const path = navigationUtils.generateNavigationPath(data, false);
      
      expect(path).toBe("/guns-n-roses/sweet-child-o-mine");
    });

    it('should remove diacritics to match CifraClub URL format', () => {
      const data = { artist: "Leonardo Gonçalves", song: "Getsêmani" };
      
      const path = navigationUtils.generateNavigationPath(data, false);
      
      expect(path).toBe("/leonardo-goncalves/getsemani");
    });
  });
});
