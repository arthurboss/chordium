/**
 * Search utilities - Central re-exports
 * Organized by functional category for easy imports
 */

// Core search utilities
export { getSearchParamsType } from './core/getSearchParamsType';
export { getQueryDisplayText } from './core/getQueryDisplayText';

// Text normalization utilities
export { normalizeForSearch } from './normalization/normalizeForSearch';
export { normalizeForAccentInsensitiveSearch } from './normalization/normalizeForAccentInsensitive';
export { isAccentInsensitiveMatch } from './normalization/accentInsensitiveMatch';

// Filtering utilities
export { filterArtistsByNameOrPath } from './filtering/filterArtistsByName';

// Formatting utilities
export { formatSearchResult } from './formatting/formatSearchResult';

// Navigation utilities
export { navigateToArtist } from './navigation/navigateToArtist';
export { navigateBackToSearch } from './navigation/navigateBackToSearch';
export { isArtistPage } from './navigation/isArtistPage';
export { extractArtistFromUrl } from './navigation/extractArtistFromUrl';
