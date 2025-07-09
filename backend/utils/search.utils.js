// Utility functions for search controller
function buildSearchQuery(artist, song) {
  if (artist && song) return `${artist} ${song}`;
  return artist || song || '';
}

function determineSearchType(artist, song, SEARCH_TYPES) {
  if (artist && !song) return SEARCH_TYPES.ARTIST;
  if (song && !artist) return SEARCH_TYPES.SONG;
  if (artist && song) return SEARCH_TYPES.SONG;
  return null;
}

export { buildSearchQuery, determineSearchType };
