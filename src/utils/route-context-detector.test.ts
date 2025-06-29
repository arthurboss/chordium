import { describe, it, expect, beforeEach } from 'vitest';
import { isMyChordSheetsRoute, getRouteContext } from './route-context-detector';

describe('route-context-detector', () => {
  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/'
      },
      writable: true
    });
  });

  describe('isMyChordSheetsRoute', () => {
    it('should return true for My Chord Sheets routes', () => {
      // Arrange
      window.location.pathname = '/my-chord-sheets/eagles/hotel-california';

      // Act
      const result = isMyChordSheetsRoute();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for base My Chord Sheets route', () => {
      // Arrange
      window.location.pathname = '/my-chord-sheets';

      // Act
      const result = isMyChordSheetsRoute();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for search result routes', () => {
      // Arrange
      window.location.pathname = '/eagles/hotel-california';

      // Act
      const result = isMyChordSheetsRoute();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for other routes', () => {
      // Arrange
      window.location.pathname = '/search';

      // Act
      const result = isMyChordSheetsRoute();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for root route', () => {
      // Arrange
      window.location.pathname = '/';

      // Act
      const result = isMyChordSheetsRoute();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getRouteContext', () => {
    it('should return "my-chord-sheets" for My Chord Sheets routes', () => {
      // Arrange
      window.location.pathname = '/my-chord-sheets/eagles/hotel-california';

      // Act
      const result = getRouteContext();

      // Assert
      expect(result).toBe('my-chord-sheets');
    });

    it('should return "search" for search result routes', () => {
      // Arrange
      window.location.pathname = '/eagles/hotel-california';

      // Act
      const result = getRouteContext();

      // Assert
      expect(result).toBe('search');
    });

    it('should return "search" for other routes', () => {
      // Arrange
      window.location.pathname = '/search';

      // Act
      const result = getRouteContext();

      // Assert
      expect(result).toBe('search');
    });
  });
});
