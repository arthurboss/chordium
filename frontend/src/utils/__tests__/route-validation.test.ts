/**
 * Quick test of the simplified route validation logic
 */
import { validateRoute } from '../route-validation';

// Test cases for the new simplified approach
const testCases = [
  // Should redirect to home (clearly invalid - admin/technical patterns)
  { path: '/admin', expected: true },
  { path: '/api', expected: true },
  { path: '/wp-admin', expected: true },
  { path: '/config', expected: true },
  { path: '/null', expected: true },
  { path: '/favicon.ico', expected: true },
  { path: '/test.php', expected: true },
  
  // Should NOT redirect (let the app handle these - they could be valid searches)
  { path: '/test1-2', expected: false }, // Could be a valid artist name!
  { path: '/123', expected: false }, // Could be a valid artist name!
  { path: '/beatles', expected: false },
  { path: '/beatles/hey-jude', expected: false },
  { path: '/unknown-artist', expected: false },
  { path: '/some-random-name', expected: false },
  { path: '/99-red-balloons', expected: false },
  
  // Chord routes - let them through unless clearly invalid
  { path: '/chord/beatles/hey-jude', expected: false },
  { path: '/chord/abc123xyz', expected: false },
  { path: '/chord/admin', expected: true }, // admin is clearly invalid
  
  // Valid paths should never redirect
  { path: '/search', expected: false },
  { path: '/upload', expected: false },
  { path: '/my-chord-sheets', expected: false },
  { path: '/my-chord-sheets/beatles/hey-jude', expected: false },
];

console.log('Simplified route validation test results:');
testCases.forEach(({ path, expected }) => {
  const result = validateRoute(path);
  const passed = result.shouldRedirectHome === expected;
  console.log(`${passed ? '✅' : '❌'} ${path} -> redirect: ${result.shouldRedirectHome} (expected: ${expected}) [${result.routeType}]`);
});
