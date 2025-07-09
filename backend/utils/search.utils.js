/**
 * Utility functions for search controller
 */

/**
 * Builds a search query string from artist and song.
 * @param {string} artist - The artist name (optional)
 * @param {string} song - The song name (optional)
 * @returns {string} The combined search query string
 */
function buildSearchQuery(artist, song) {
  if (artist && song) return `${artist} ${song}`;
  return artist || song || '';
}

/**
 * Determines the search type based on provided artist and song.
 * @param {string} artist - The artist name (optional)
 * @param {string} song - The song name (optional)
 * @param {object} SEARCH_TYPES - Enum of search types
 * @returns {string|null} The determined search type or null if invalid
 */
function determineSearchType(artist, song, SEARCH_TYPES) {
  if (artist && !song) return SEARCH_TYPES.ARTIST;
  if (song && !artist) return SEARCH_TYPES.SONG;
  if (artist && song) return SEARCH_TYPES.SONG;
  return null;
}

export { buildSearchQuery, determineSearchType };
