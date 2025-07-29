/**
 * Tests for chord she  };

  describe('LRU Logic with lastAccessed', () => {
    it('should give higher priority to recently accessed items', () => {
      // Item cached long ago but accessed recently
      const recentlyAccessed: StoredChordSheet = {
        ...baseChordSheet,
        storage: {
          ...baseChordSheet.storage,
          timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago (old cache)
          lastAccessed: Date.now() - 5 * 60 * 1000 // 5 minutes ago (recent access)
        }
      };

      // Item cached recently but not accessed
      const oldAccess: StoredChordSheet = {
        ...baseChordSheet,
        storage: {
          ...baseChordSheet.storage,
          timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago (recent cache)
          lastAccessed: Date.now() - 10 * 24 * 60 * 60 * 1000 // 10 days ago (old access)
        }
      };gy with lastAccessed logic
 * Verifies that LRU eviction uses lastAccessed instead of timestamp
 */

import { describe, it, expect } from 'vitest';
import { calculateChordSheetCleanupPriority } from '../strategy/chord-sheet';
import type { StoredChordSheet } from '../../../types/chord-sheet';

/** Helper function to create test StoredChordSheet with new structure */
function createTestStoredChordSheet(overrides: Partial<StoredChordSheet> = {}): StoredChordSheet {
  return {
    title: 'Test Song',
    artist: 'Test Artist',
    songChords: '[Verse]\nC G Am F',
    songKey: 'C',
    guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    guitarCapo: 0,
    storage: {
      saved: false,
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      lastAccessed: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago  
      accessCount: 3,
      version: 1,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Expires tomorrow
    },
    ...overrides,
  };
}

describe('Chord Sheet Cleanup Strategy with lastAccessed', () => {
  const baseChordSheet = createTestStoredChordSheet();

  describe('LRU Logic with lastAccessed', () => {
    it('should give higher priority to recently accessed items', () => {
      // Item cached long ago but accessed recently
      const recentlyAccessed = createTestStoredChordSheet({
        storage: {
          ...baseChordSheet.storage,
          timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago (old cache)
          lastAccessed: Date.now() - 5 * 60 * 1000 // 5 minutes ago (recent access)
        }
      });

      // Item cached recently but not accessed recently
      const oldAccess = createTestStoredChordSheet({
        storage: {
          ...baseChordSheet.storage,
          timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago (recent cache)
          lastAccessed: Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 days ago (old access)
        }
      });

      const recentResult = calculateChordSheetCleanupPriority(recentlyAccessed);
      const oldResult = calculateChordSheetCleanupPriority(oldAccess);

      // Recently accessed should have higher priority (keep longer)
      expect(recentResult.priority).toBeGreaterThan(oldResult.priority);
      expect(recentResult.reason).toContain('accessed');
    });

    it('should protect items accessed today', () => {
      const accessedToday = createTestStoredChordSheet({
        storage: {
          ...baseChordSheet.storage,
          lastAccessed: Date.now() - 2 * 60 * 60 * 1000 // 2 hours ago
        }
      });

  describe('LRU Logic with lastAccessed', () => {
    it('should give higher priority to recently accessed items', () => {
      // Item cached long ago but accessed recently
      const recentlyAccessed: StoredChordSheet = {
        ...baseChordSheet,
        timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago (old cache)
        lastAccessed: Date.now() - 5 * 60 * 1000 // 5 minutes ago (recent access)
      };

      // Item cached recently but not accessed recently
      const oldAccess: StoredChordSheet = {
        ...baseChordSheet,
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago (recent cache)
        lastAccessed: Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 days ago (old access)
      };

      const recentResult = calculateChordSheetCleanupPriority(recentlyAccessed);
      const oldResult = calculateChordSheetCleanupPriority(oldAccess);

      // Recently accessed should have higher priority (keep longer)
      expect(recentResult.priority).toBeGreaterThan(oldResult.priority);
      expect(recentResult.reason).toContain('accessed');
    });

    it('should protect items accessed today', () => {
      const accessedToday: StoredChordSheet = {
        ...baseChordSheet,
        lastAccessed: Date.now() - 2 * 60 * 60 * 1000 // 2 hours ago
      };

      const result = calculateChordSheetCleanupPriority(accessedToday);

      expect(result.priority).toBeGreaterThan(0);
      expect(result.reason).toContain('accessed today');
      expect(result.canRemove).toBe(true);
    });

    it('should give medium priority to items accessed this week', () => {
      const accessedThisWeek: StoredChordSheet = {
        ...baseChordSheet,
        lastAccessed: Date.now() - 3 * 24 * 60 * 60 * 1000 // 3 days ago
      };

      const result = calculateChordSheetCleanupPriority(accessedThisWeek);

      expect(result.priority).toBeGreaterThan(0);
      expect(result.reason).toContain('accessed this week');
      expect(result.canRemove).toBe(true);
    });

    it('should give lower priority to items not accessed recently than recently accessed items', () => {
      const notAccessedRecently: StoredChordSheet = {
        chordSheet: {
          title: 'Test Song',
          artist: 'Test Artist',
          songChords: '[Verse]\nC G Am F',
          songKey: 'C',
          guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
          guitarCapo: 0
        },
        saved: false,
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        accessCount: 1,
        version: 1,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        lastAccessed: Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days ago (very old)
      };

      const recentlyAccessed: StoredChordSheet = {
        ...notAccessedRecently,
        lastAccessed: Date.now() - 1 * 60 * 60 * 1000 // 1 hour ago
      };

      const oldResult = calculateChordSheetCleanupPriority(notAccessedRecently);
      const recentResult = calculateChordSheetCleanupPriority(recentlyAccessed);

      // Recently accessed should have higher priority (kept longer)
      expect(recentResult.priority).toBeGreaterThan(oldResult.priority);
      expect(oldResult.canRemove).toBe(true);
      expect(recentResult.canRemove).toBe(true);
    });
  });

  describe('Saved Items Protection', () => {
    it('should never remove saved items regardless of lastAccessed', () => {
      const savedButOldAccess: StoredChordSheet = {
        ...baseChordSheet,
        saved: true,
        lastAccessed: Date.now() - 365 * 24 * 60 * 60 * 1000 // 1 year ago
      };

      const result = calculateChordSheetCleanupPriority(savedButOldAccess);

      expect(result.priority).toBe(1000);
      expect(result.reason).toContain('User saved - never auto-remove');
      expect(result.canRemove).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle items with lastAccessed in the future gracefully', () => {
      const futureAccess: StoredChordSheet = {
        ...baseChordSheet,
        lastAccessed: Date.now() + 24 * 60 * 60 * 1000 // 1 day in future (clock skew)
      };

      const result = calculateChordSheetCleanupPriority(futureAccess);

      // Should treat as "accessed today" since it's recent
      expect(result.priority).toBeGreaterThan(0);
      expect(result.canRemove).toBe(true);
    });

    it('should handle missing lastAccessed field', () => {
      const missingLastAccessed: StoredChordSheet = {
        ...baseChordSheet,
        lastAccessed: 0 // Simulate missing/invalid lastAccessed
      };

      // Should not throw an error
      expect(() => {
        calculateChordSheetCleanupPriority(missingLastAccessed);
      }).not.toThrow();
    });
  });
});
