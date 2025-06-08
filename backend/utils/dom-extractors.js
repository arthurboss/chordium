
/**
 * Extracts search results from CifraClub search page DOM
 * @returns {Array} - Array of search results with title, path, and artist
 */
export function extractSearchResults() {
  const links = Array.from(document.querySelectorAll('.gsc-result a'));
  return links
    .filter(link => {
      const parent = link.parentElement;
      return parent && parent.className === 'gs-title';
    })
    .map(link => {
      const url = link.href.startsWith('http') ? link.href : `${window.location.origin}${link.href}`;
      // Extract path from URL (e.g., "https://www.cifraclub.com.br/oasis/wonderwall/" -> "oasis/wonderwall")
      const pathMatch = url.match(/cifraclub\.com\.br\/(.+?)\/?$/);
      const path = pathMatch ? pathMatch[1] : url;
      
      const rawTitle = link.textContent.trim();
      
      // Extract artist information from title or URL
      let artist = '';
      let title = rawTitle;
      
      // First try to extract from title (format: "Song Title - Artist Name - Cifra Club")
      if (rawTitle.includes(' - ')) {
        // Remove "- Cifra Club" suffix first
        const cleanTitle = rawTitle.replace(/ - Cifra Club$/, '').trim();
        
        // Split by " - " to separate song and artist
        const parts = cleanTitle.split(' - ');
        if (parts.length >= 2) {
          // Format: "Song Title - Artist Name"
          title = parts.slice(0, -1).join(' - ').trim();
          artist = parts[parts.length - 1].trim();
        } else {
          title = cleanTitle;
        }
      }
      
      // Fallback: extract artist from URL if not found in title
      if (!artist && path) {
        const pathSegments = path.split('/');
        if (pathSegments.length >= 2) {
          // For song URLs like "oasis/wonderwall", artist is first segment
          artist = pathSegments[0]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        } else if (pathSegments.length === 1) {
          // For artist URLs like "oasis", use the segment as artist
          artist = pathSegments[0]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }
      
      return {
        title,
        url,  // Include the full URL for validation
        path,
        artist: artist || ''
      };
    })
    .filter(r => r.title && r.path);
}

/**
 * Extracts artist songs from CifraClub artist page DOM
 * @returns {Array} - Array of song objects with title, url, and artist
 */
export function extractArtistSongs() {
  const songMap = new Map();
  
  // Extract artist name from page title or URL
  let artistName = 'Unknown Artist';
  
  // Try to get artist name from page title (format: "Artist Name - Cifra Club")
  const pageTitle = document.title;
  if (pageTitle) {
    const titleMatch = pageTitle.match(/^(.+?)\s*-\s*Cifra Club$/);
    if (titleMatch) {
      artistName = titleMatch[1].trim();
    }
  }
  
  // Fallback: extract artist from URL pathname
  if (artistName === 'Unknown Artist') {
    const pathname = window.location.pathname;
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      // Convert slug to readable name (e.g., "ac-dc" -> "AC/DC")
      artistName = pathSegments[0]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
  
  document.querySelectorAll('a.art_music-link').forEach(link => {
    try {
      const title = link.textContent.trim();
      const url = link.href;
      if (title && url) {
        // Extract path from URL (e.g., "https://www.cifraclub.com.br/oasis/wonderwall/" -> "oasis/wonderwall")
        const pathMatch = url.match(/cifraclub\.com\.br\/(.+?)\/?$/);
        const path = pathMatch ? pathMatch[1] : url;
        
        songMap.set(url, {
          title: title.replace(/\s+/g, ' ').trim(),
          url,  // Include URL for consistency with extractSearchResults
          path,
          artist: artistName
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
