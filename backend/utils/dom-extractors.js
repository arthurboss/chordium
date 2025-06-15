
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
 * Extracts chord sheet data from CifraClub song page DOM
 * @returns {Object} - ChordSheet object with chords, key, tuning, capo, title, artist
 */
export function extractChordSheet() {
  const preElement = document.querySelector('pre');
  const songChords = preElement ? preElement.textContent : '';
  
  // Extract title and artist from page
  let title = '';
  let artist = '';
  
  // For chord sheet pages, try to get title from h1.t1 first (CifraClub specific)
  const titleElement = document.querySelector('h1.t1');
  if (titleElement) {
    title = titleElement.textContent?.trim() || '';
  }
  
  // Try to get title and artist from page title (format: "Song Title - Artist Name - Cifra Club")
  // Only use this if we didn't find title from h1.t1
  if (!title) {
    const pageTitle = document.title;
    if (pageTitle) {
      // Remove "- Cifra Club" suffix first
      const cleanTitle = pageTitle.replace(/ - Cifra Club$/, '').trim();
      
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
  }
  
  // If we got title from h1.t1 but not artist, extract artist from page title
  if (title && !artist) {
    const pageTitle = document.title;
    if (pageTitle) {
      const cleanTitle = pageTitle.replace(/ - Cifra Club$/, '').trim();
      const parts = cleanTitle.split(' - ');
      if (parts.length >= 2) {
        artist = parts[parts.length - 1].trim();
      }
    }
  }
  
  // Fallback: extract artist from URL if not found in title
  if (!artist) {
    const pathname = window.location.pathname;
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 2) {
      // For song URLs like "/oasis/wonderwall/", artist is first segment
      artist = pathSegments[0]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
  
  // Extract song title from URL if not found in page title
  if (!title) {
    const pathname = window.location.pathname;
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 2) {
      // For song URLs like "/oasis/wonderwall/", song is second segment
      title = pathSegments[1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
  
  // Extract key, tuning, and capo information
  // These fields will be implemented when DOM structure is identified
  const songKey = '';
  const guitarTuning = ['E', 'A', 'D', 'G', 'B', 'E']; // Standard tuning default
  const guitarCapo = 0; // No capo default
  
  return {
    songChords,
    songKey,
    guitarTuning,
    guitarCapo,
    title: title || '',
    artist: artist || 'Unknown Artist'
  };
}
