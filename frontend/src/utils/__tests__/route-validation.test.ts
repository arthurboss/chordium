/**
 * Test suite for the simplified route validation logic
 */
import { describe, test, expect } from 'vitest';
import { validateRoute } from '../route-validation';

describe('Route Validation', () => {
  describe('Invalid routes that should redirect to home', () => {
    const invalidRoutes = [
      '/admin',
      '/api', 
      '/wp-admin',
      '/config',
      '/null',
      '/favicon.ico',
      '/test.php',
    ];

    test.each(invalidRoutes)('should redirect %s to home', (path) => {
      const result = validateRoute(path);
      expect(result.shouldRedirectHome).toBe(true);
    });
  });

  describe('Valid routes that should NOT redirect', () => {
    const validRoutes = [
      // Artist names that could be valid
      { path: '/test1-2', description: 'could be a valid artist name' },
      { path: '/123', description: 'could be a valid artist name' },
      { path: '/beatles', description: 'valid artist name' },
      { path: '/beatles/hey-jude', description: 'valid artist and song' },
      { path: '/unknown-artist', description: 'potential artist name' },
      { path: '/some-random-name', description: 'potential artist name' },
      { path: '/99-red-balloons', description: 'potential artist/song name' },
      
      // Chord routes
      { path: '/chord/beatles/hey-jude', description: 'valid chord route' },
      { path: '/chord/abc123xyz', description: 'potential chord route' },
      { path: '/chord/admin', description: 'admin as artist name in chord route' },
      
      // App routes
      { path: '/search', description: 'search page' },
      { path: '/upload', description: 'upload page' },
      { path: '/my-chord-sheets', description: 'user chord sheets' },
      { path: '/my-chord-sheets/beatles/hey-jude', description: 'specific chord sheet' },
    ];

    test.each(validRoutes)('should NOT redirect $path ($description)', ({ path }) => {
      const result = validateRoute(path);
      expect(result.shouldRedirectHome).toBe(false);
    });
  });

  describe('Route type detection', () => {
    test('should identify chord routes correctly', () => {
      const result = validateRoute('/chord/beatles/hey-jude');
      expect(result.routeType).toBe('chord');
    });

    test('should identify page routes correctly', () => {
      const result = validateRoute('/search');
      expect(result.routeType).toBe('page');
    });

    test('should identify artist routes correctly', () => {
      const result = validateRoute('/beatles');
      expect(result.routeType).toBe('artist');
    });

    test('should identify invalid routes correctly', () => {
      const result = validateRoute('/admin');
      expect(result.routeType).toBe('invalid');
    });
  });
});
