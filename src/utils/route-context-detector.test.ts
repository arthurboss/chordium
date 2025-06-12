import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isMySONgsRoute, getRouteContext } from './route-context-detector';

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

  describe('isMySONgsRoute', () => {
    it('should return true for My Songs routes', () => {
      // Arrange
      window.location.pathname = '/my-songs/eagles/hotel-california';

      // Act
      const result = isMySONgsRoute();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for base My Songs route', () => {
      // Arrange
      window.location.pathname = '/my-songs';

      // Act
      const result = isMySONgsRoute();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for search result routes', () => {
      // Arrange
      window.location.pathname = '/eagles/hotel-california';

      // Act
      const result = isMySONgsRoute();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for other routes', () => {
      // Arrange
      window.location.pathname = '/search';

      // Act
      const result = isMySONgsRoute();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for root route', () => {
      // Arrange
      window.location.pathname = '/';

      // Act
      const result = isMySONgsRoute();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getRouteContext', () => {
    it('should return "my-songs" for My Songs routes', () => {
      // Arrange
      window.location.pathname = '/my-songs/eagles/hotel-california';

      // Act
      const result = getRouteContext();

      // Assert
      expect(result).toBe('my-songs');
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
