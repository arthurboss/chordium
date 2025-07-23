/**
 * Smart route validation for Chordium app
 * Distinguishes between potentially valid music routes and clearly invalid URLs
 */

export interface RouteValidationResult {
  isValid: boolean;
  routeType: 'artist' | 'song' | 'chord' | 'page' | 'invalid';
  shouldRedirectHome: boolean;
  errorMessage?: string;
}

/**
 * Patterns that indicate clearly invalid URLs that should redirect to home
 * These are patterns that are definitely NOT music-related searches
 */
const INVALID_URL_PATTERNS = [
  // Admin/system paths
  /^(admin|api|config|system|debug|wp-admin|wp-|wordpress)/, 
  // File extensions
  /\.(php|asp|jsp|cgi|exe|zip|pdf|doc)$/, 
  // Obviously technical patterns
  /^(null|undefined|NaN|favicon\.ico)$/i,
  // Very short or clearly invalid
  /^[a-zA-Z]$/, // Single letters only
  /^\./, // Starting with dot
];

/**
 * Patterns that look like valid music-related routes
 */
const MUSIC_ROUTE_PATTERNS = [
  // Artist names (letters, spaces, some special chars)
  /^[a-zA-Z][a-zA-Z0-9\s\-_'.,()&]+$/,
  // Song titles (more flexible, can start with numbers like "99 Red Balloons")
  /^[a-zA-Z0-9][a-zA-Z0-9\s\-_'.,()&!?]+$/,
];

/**
 * Known valid page routes
 */
const VALID_PAGE_ROUTES = [
  'search',
  'upload', 
  'my-chord-sheets',
  'search-refresh'
];

/**
 * Validates if a route path segment could be a valid artist or song name
 * Now much more permissive - only rejects obviously technical patterns
 */
function isValidMusicName(name: string): boolean {
  if (!name || name.length < 1) return false;
  
  // Check if it matches any clearly invalid patterns
  const isInvalid = INVALID_URL_PATTERNS.some(pattern => pattern.test(name));
  return !isInvalid;
}

/**
 * Validates a route and determines how to handle it
 */
export function validateRoute(pathname: string): RouteValidationResult {
  const cleanPath = pathname.replace(/(^\/+)|(\/+$)/g, ''); // Remove leading/trailing slashes
  const segments = cleanPath.split('/').filter(Boolean);
  
  if (!segments.length) {
    return { isValid: true, routeType: 'page', shouldRedirectHome: false };
  }
  
  const [first, second, third] = segments;
  
  // Check for valid page routes first
  if (VALID_PAGE_ROUTES.includes(first)) {
    return { isValid: true, routeType: 'page', shouldRedirectHome: false };
  }
  
  // Handle chord routes
  if (first === 'chord') {
    return validateChordRoute(second, third);
  }
  
  // Handle my-chord-sheets routes
  if (first === 'my-chord-sheets' && second && third) {
    return validateMyChordSheetsRoute(second, third);
  }
  
  // Handle artist/song routes
  return validateArtistSongRoute(segments, first, second);
}

function validateChordRoute(second: string, third: string): RouteValidationResult {
  if (!second) {
    return { 
      isValid: false, 
      routeType: 'invalid', 
      shouldRedirectHome: true 
    };
  }
  
  if (third) {
    // /chord/:artist/:song
    if (isValidMusicName(second) && isValidMusicName(third)) {
      return { 
        isValid: true, 
        routeType: 'chord', 
        shouldRedirectHome: false,
        errorMessage: `Chord sheet not found for "${third}" by ${second}`
      };
    }
  } else if (second.length > 3 && !/^\d+-\d+$/.test(second)) {
    // /chord/:id - could be valid ID format
    return { 
      isValid: true, 
      routeType: 'chord', 
      shouldRedirectHome: false,
      errorMessage: `Chord sheet not found`
    };
  }
  
  return { 
    isValid: false, 
    routeType: 'invalid', 
    shouldRedirectHome: true 
  };
}

function validateMyChordSheetsRoute(second: string, third: string): RouteValidationResult {
  if (isValidMusicName(second) && isValidMusicName(third)) {
    return { 
      isValid: true, 
      routeType: 'song', 
      shouldRedirectHome: false,
      errorMessage: `Song not found in your collection: "${third}" by ${second}`
    };
  }
  return { 
    isValid: false, 
    routeType: 'invalid', 
    shouldRedirectHome: true 
  };
}

function validateArtistSongRoute(segments: string[], first: string, second: string): RouteValidationResult {
  // Check if first segment matches any clearly invalid patterns
  const isFirstInvalid = INVALID_URL_PATTERNS.some(pattern => pattern.test(first));
  
  if (segments.length === 1) {
    // /:artist - only reject if it's clearly invalid
    if (isFirstInvalid) {
      return { 
        isValid: false, 
        routeType: 'invalid', 
        shouldRedirectHome: true 
      };
    }
    // Let all other artist searches through
    return { 
      isValid: true, 
      routeType: 'artist', 
      shouldRedirectHome: false
    };
  } else if (segments.length === 2) {
    // /:artist/:song - only reject if clearly invalid
    const isSecondInvalid = INVALID_URL_PATTERNS.some(pattern => pattern.test(second));
    if (isFirstInvalid || isSecondInvalid) {
      return { 
        isValid: false, 
        routeType: 'invalid', 
        shouldRedirectHome: true 
      };
    }
    // Let all other song searches through
    return { 
      isValid: true, 
      routeType: 'song', 
      shouldRedirectHome: false
    };
  }
  
  // For longer paths, default to not redirecting
  return { 
    isValid: true, 
    routeType: 'page', 
    shouldRedirectHome: false 
  };
}
