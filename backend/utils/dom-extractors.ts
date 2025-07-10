/**
 * DOM extraction utilities for CifraClub pages
 * These functions run in the browser context via Puppeteer's page.evaluate()
 */

import type { Song } from '../../shared/types/domain/song.js';
import type { ChordSheet } from '../../shared/types/domain/chord-sheet.js';

/**
 * Search result from DOM extraction
 */
import type { DOMSearchResult } from '../types/dom.types.js';

/**
 * Extracts search results from CifraClub search page DOM
 */
export function extractSearchResults(): DOMSearchResult[] {
  const links = Array.from(document.querySelectorAll('.gsc-result a'));
  return links
    .filter(link => {
      const parent = link.parentElement;
      return parent && parent.className === 'gs-title';
    })
    .map(link => {
      const url = (link as HTMLAnchorElement).href.startsWith('http')
        ? (link as HTMLAnchorElement).href
        : `${window.location.origin}${(link as HTMLAnchorElement).href}`;
      // Extract path from URL (e.g., "https://www.cifraclub.com.br/oasis/wonderwall/" -> "oasis/wonderwall")
      const pathMatch = url.match(/cifraclub\.com\.br\/(.+?)\/?$/);
      const path = pathMatch ? pathMatch[1] : url;

      const rawTitle = link.textContent?.trim() || '';

      // Extract artist information from title or URL
      let artist = '';
      let title = rawTitle;

      // First try to extract from title (format: "Song Title - Artist Name - Cifra Club" or "Artist Name - Cifra Club")
      if (rawTitle.includes(' - ')) {
        // Remove "- Cifra Club" suffix first
        const cleanTitle = rawTitle.replace(/ - Cifra Club$/, '').trim();

        // Split by " - " to separate song and artist
        const parts = cleanTitle.split(' - ');
        if (parts.length >= 2) {
          // Format: "Song Title - Artist Name"
          title = parts.slice(0, -1).join(' - ').trim();
          artist = parts[parts.length - 1].trim();
        } else if (parts.length === 1) {
          // Format: "Artist Name - Cifra Club" (artist-only page)
          title = cleanTitle;
          // For artist-only pages, set artist same as title
          const pathSegments = path.split('/').filter(Boolean);
          if (pathSegments.length === 1) {
            // This is an artist page, not a song page
            artist = cleanTitle;
          }
        }
      }

      // Fallback: extract artist from URL if not found in title
      if (!artist) {
        const pathSegments = path.split('/').filter(Boolean);
        if (pathSegments.length >= 2) {
          // For song URLs like "oasis/wonderwall", artist is first segment
          artist = pathSegments[0]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }

      return {
        title,
        path,
        artist: artist || ''
      };
    })
    .filter(r => {
      if (!r.title || !r.path) return false;
      const segments = r.path.split('/').filter(Boolean);
      // Only allow exactly 2 segments (artist/song)
      if (segments.length !== 2) return false;
      // Exclude if last segment is "letra"
      if (segments[1].toLowerCase() === 'letra') return false;
      // Exclude if second segment is numeric (e.g., /artist/12345)
      if (/^\d+$/.test(segments[1])) return false;
      return true;
    });
}

/**
 * Extracts artist songs from CifraClub artist page DOM
 */
export function extractArtistSongs(): Song[] {
  const songMap = new Map<string, Song>();
  
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
      const title = link.textContent?.trim() || '';
      const url = (link as HTMLAnchorElement).href;
      if (title && url) {
        // Extract path from URL (e.g., "https://www.cifraclub.com.br/oasis/wonderwall/" -> "oasis/wonderwall")
        const pathMatch = url.match(/cifraclub\.com\.br\/(.+?)\/?$/);
        const path = pathMatch ? pathMatch[1] : url;

        // Debug: log each candidate song link and path
        // eslint-disable-next-line no-console
        console.log('[DEBUG][SCRAPE] Candidate:', { title, url, path });

        songMap.set(url, {
          title: title.replace(/\s+/g, ' ').trim(),
          path,
          artist: artistName
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[DEBUG][SCRAPE] Error processing song:', e);
    }
  });

  // Debug: log all collected songs before filtering
  // eslint-disable-next-line no-console
  console.log('[DEBUG][SCRAPE] All collected songs:', Array.from(songMap.values()));

  // Filtering step: only allow valid song paths (2 segments, not numeric, not letra, etc)
  const filtered = Array.from(songMap.values()).filter(song => {
    if (!song.title || !song.path) return false;
    const segments = song.path.split('/').filter(Boolean);
    // Only allow exactly 2 segments (artist/song)
    if (segments.length !== 2) return false;
    // Exclude if last segment is "letra"
    if (segments[1].toLowerCase() === 'letra') return false;
    // Exclude if second segment is numeric (e.g., /artist/12345)
    if (/^\d+$/.test(segments[1])) return false;
    // Debug: log filtering decision
    // eslint-disable-next-line no-console
    console.log('[DEBUG][SCRAPE][FILTER]', song, { segments });
    return true;
  });
  // Debug: log final filtered songs
  // eslint-disable-next-line no-console
  console.log('[DEBUG][SCRAPE] Filtered songs:', filtered);
  return filtered;
}

/**
 * Extracts chord sheet data from CifraClub song page DOM
 * Enhanced with better error handling and multiple fallback strategies
 */
export function extractChordSheet(): ChordSheet {
  const preElement = document.querySelector('pre');
  const songChords = preElement ? preElement.textContent || '' : '';
  
  // Extract title and artist from page
  let title = '';
  let artist = '';
  
  // For chord sheet pages, try to get title from h1.t1 first (CifraClub specific)
  const titleElement = document.querySelector('h1.t1');
  if (titleElement) {
    title = titleElement.textContent?.trim() || '';
  }
  
  // For chord sheet pages, try to get artist from h2.t3 a first (CifraClub specific)
  const artistElement = document.querySelector('h2.t3 a');
  if (artistElement) {
    artist = artistElement.textContent?.trim() || '';
  }
  
  // Try to get title and artist from page title (format: "Song Title - Artist Name - Cifra Club")
  // Only use this if we didn't find title from h1.t1 or artist from h2.t3 a
  if (!title || !artist) {
    const pageTitle = document.title;
    if (pageTitle) {
      // Remove "- Cifra Club" suffix first
      const cleanTitle = pageTitle.replace(/ - Cifra Club$/, '').trim();
      
      // Split by " - " to separate song and artist
      const parts = cleanTitle.split(' - ');
      if (parts.length >= 2) {
        // Format: "Song Title - Artist Name"
        if (!title) {
          title = parts.slice(0, -1).join(' - ').trim();
        }
        if (!artist) {
          artist = parts[parts.length - 1].trim();
        }
      } else if (!title) {
        title = cleanTitle;
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
  // Extract song key from span#cifra_tom a element (CifraClub specific)
  let songKey = '';
  const keyElement = document.querySelector('span#cifra_tom a');
  if (keyElement) {
    songKey = keyElement.textContent?.trim() || '';
  }
  
  // Extract capo position from span[data-cy="song-capo"] a element (CifraClub specific)
  let guitarCapo = 0;
  const capoElement = document.querySelector('span[data-cy="song-capo"] a');
  if (capoElement) {
    const capoText = capoElement.textContent?.trim() || '';
    // Extract number from text like "1ª casa", "2ª casa", etc.
    const capoMatch = capoText.match(/(\d+)/);
    if (capoMatch) {
      guitarCapo = parseInt(capoMatch[1], 10);
    }
  }
  
  const guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'] = ['E', 'A', 'D', 'G', 'B', 'E']; // Standard tuning default
  
  return {
    songChords,
    songKey,
    guitarTuning,
    guitarCapo,
    title: title || '',
    artist: artist || 'Unknown Artist'
  };
}

/**
 * Extracts song key from CifraClub page DOM
 */
export function extractSongKey(): string {
  // Extract song key from span#cifra_tom a element (CifraClub specific)
  const keyElement = document.querySelector('span#cifra_tom a');
  if (keyElement) {
    const key = keyElement.textContent?.trim() || '';
    return key;
  }
  
  return '';
}

/**
 * Extracts guitar capo position from CifraClub page DOM
 */
export function extractGuitarCapo(): number {
  // Extract capo position from span[data-cy="song-capo"] a element (CifraClub specific)
  const capoElement = document.querySelector('span[data-cy="song-capo"] a');
  if (capoElement) {
    const capoText = capoElement.textContent?.trim() || '';
    // Extract number from text like "1ª casa", "2ª casa", etc.
    const capoMatch = capoText.match(/(\d+)/);
    if (capoMatch) {
      return parseInt(capoMatch[1], 10);
    }
  }
  
  return 0;
}
