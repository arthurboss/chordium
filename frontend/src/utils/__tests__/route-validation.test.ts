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
      '/chord/admin', // moved here, as 'admin' is not a valid artist name
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

describe('WordPress pattern specificity', () => {
  test('should redirect WordPress patterns in chord routes', () => {
    expect(validateRoute('/chord/wp-admin').shouldRedirectHome).toBe(true);
    expect(validateRoute('/chord/wp-content').shouldRedirectHome).toBe(true);
    expect(validateRoute('/chord/wp-includes').shouldRedirectHome).toBe(true);
    expect(validateRoute('/chord/wordpress').shouldRedirectHome).toBe(true);
  });

  test('should allow legitimate wp- patterns in chord routes', () => {
    expect(validateRoute('/chord/wp-40').shouldRedirectHome).toBe(false);
    expect(validateRoute('/chord/wps-office').shouldRedirectHome).toBe(false);
    expect(validateRoute('/chord/wp-administer').shouldRedirectHome).toBe(false);
    expect(validateRoute('/chord/wp-contention').shouldRedirectHome).toBe(false);
    expect(validateRoute('/chord/wp-included').shouldRedirectHome).toBe(false);
    expect(validateRoute('/chord/wp-admins').shouldRedirectHome).toBe(false);
    expect(validateRoute('/chord/wp-content-manager').shouldRedirectHome).toBe(false);
    expect(validateRoute('/chord/wordpressing').shouldRedirectHome).toBe(false);
  });
});
