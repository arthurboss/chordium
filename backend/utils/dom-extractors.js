
/**
 * Extracts search results from CifraClub search page DOM
 * @returns {Array} - Array of search results with title and url
 */
export function extractSearchResults() {
  const links = Array.from(document.querySelectorAll('.gsc-result a'));
  return links
    .filter(link => {
      const parent = link.parentElement;
      return parent && parent.className === 'gs-title';
    })
    .map(link => ({
      title: link.textContent.trim(),
      url: link.href.startsWith('http') ? link.href : `${window.location.origin}${link.href}`
    }))
    .filter(r => r.title && r.url);
}

/**
 * Extracts artist songs from CifraClub artist page DOM
 * @returns {Array} - Array of song objects with title and url
 */
export function extractArtistSongs() {
  const songMap = new Map();
  
  document.querySelectorAll('a.art_music-link').forEach(link => {
    try {
      const title = link.textContent.trim();
      const url = link.href;
      if (title && url) {
        songMap.set(url, {
          title: title.replace(/\s+/g, ' ').trim(),
          url
        });
      }
    } catch (e) {
      console.error('Error processing song:', e);
    }
  });

  return Array.from(songMap.values());
}

/**
 * Extracts chord sheet content from CifraClub song page DOM
 * @returns {string} - The chord sheet content or empty string
 */
export function extractChordSheet() {
  const preElement = document.querySelector('pre');
  return preElement ? preElement.textContent : '';
}
