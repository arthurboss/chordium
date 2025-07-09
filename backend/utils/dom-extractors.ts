/**
 * DOM extraction utilities for CifraClub pages
 * These functions run in the browser context via Puppeteer's page.evaluate()
 */

import type { Song } from '../../shared/types/domain/song.js';
import type { ChordSheet } from '../../shared/types/domain/chord-sheet.js';

interface RawSearchResult {
  title: string;
  path: string;
  artist: string;
}

/**
 * Extracts search results from CifraClub search page DOM
 */
export function extractSearchResults(): RawSearchResult[] {
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
    .filter(r => r.title && r.path);
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
        
        songMap.set(url, {
          title: title.replace(/\s+/g, ' ').trim(),
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
 * Enhanced with better error handling and multiple fallback strategies
 */
export function extractChordSheet(): ChordSheet {
  console.log('🔍 Starting chord sheet extraction...');
  
  // Extract song chords from pre element
  const preElement = document.querySelector('pre');
  const songChords = preElement ? preElement.textContent || '' : '';
  console.log(`📄 Found song chords: ${songChords.length} characters`);
  
  // Extract title and artist from page
  let title = '';
  let artist = '';
  
  // Strategy 1: Try CifraClub specific selectors
  console.log('🎯 Strategy 1: CifraClub specific selectors');
  
  // Try to get title from h1.t1 (legacy selector)
  const titleElement = document.querySelector('h1.t1');
  if (titleElement) {
    title = titleElement.textContent?.trim() || '';
    console.log(`📝 Found title from h1.t1: "${title}"`);
  } else {
    console.log('❌ h1.t1 not found, trying alternatives...');
    // Try alternative title selectors
    const altTitleSelectors = ['h1', '.song-title', '[data-cy="song-title"]', '.t1'];
    for (const selector of altTitleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        title = element.textContent.trim();
        console.log(`📝 Found title from ${selector}: "${title}"`);
        break;
      }
    }
  }
  
  // Try to get artist from h2.t3 a (legacy selector)
  const artistElement = document.querySelector('h2.t3 a');
  if (artistElement) {
    artist = artistElement.textContent?.trim() || '';
    console.log(`🎤 Found artist from h2.t3 a: "${artist}"`);
  } else {
    console.log('❌ h2.t3 a not found, trying alternatives...');
    // Try alternative artist selectors
    const altArtistSelectors = [
      'h2.t3', 
      '.artist-name', 
      '[data-cy="artist-name"]', 
      '.t3', 
      'h2 a',
      '.breadcrumb a:last-child'
    ];
    for (const selector of altArtistSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        artist = element.textContent.trim();
        console.log(`🎤 Found artist from ${selector}: "${artist}"`);
        break;
      }
    }
  }
  
  // Strategy 2: Extract from page title
  console.log('🎯 Strategy 2: Page title extraction');
  if (!title || !artist) {
    const pageTitle = document.title;
    console.log(`📄 Page title: "${pageTitle}"`);
    
    if (pageTitle) {
      // Remove "- Cifra Club" suffix first
      const cleanTitle = pageTitle.replace(/ - Cifra Club$/, '').trim();
      console.log(`🧹 Clean title: "${cleanTitle}"`);
      
      // Split by " - " to separate song and artist
      const parts = cleanTitle.split(' - ');
      console.log(`📊 Title parts:`, parts);
      
      if (parts.length >= 2) {
        // Format: "Song Title - Artist Name"
        if (!title) {
          title = parts.slice(0, -1).join(' - ').trim();
          console.log(`📝 Extracted title from page title: "${title}"`);
        }
        if (!artist) {
          artist = parts[parts.length - 1].trim();
          console.log(`🎤 Extracted artist from page title: "${artist}"`);
        }
      } else if (!title) {
        title = cleanTitle;
        console.log(`📝 Using full clean title: "${title}"`);
      }
    }
  }
  
  // Strategy 3: Extract from URL
  console.log('🎯 Strategy 3: URL path extraction');
  const pathname = window.location.pathname;
  const pathSegments = pathname.split('/').filter(Boolean);
  console.log(`🔗 URL path segments:`, pathSegments);
  
  if (!artist && pathSegments.length >= 2) {
    // For song URLs like "/banda-libanos/alem-do-horizonte/", artist is first segment
    const artistSlug = pathSegments[0];
    artist = artistSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    console.log(`🎤 Extracted artist from URL: "${artist}"`);
  }
  
  if (!title && pathSegments.length >= 2) {
    // Song is second segment
    const songSlug = pathSegments[1];
    title = songSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    console.log(`📝 Extracted title from URL: "${title}"`);
  }
  
  // Extract key, tuning, and capo information
  console.log('🎵 Extracting metadata...');
  
  // Extract song key from span#cifra_tom a element (CifraClub specific)
  let songKey = '';
  const keyElement = document.querySelector('span#cifra_tom a');
  if (keyElement) {
    songKey = keyElement.textContent?.trim() || '';
    console.log(`🔑 Found song key: "${songKey}"`);
  } else {
    console.log('❌ Song key not found');
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
      console.log(`🎸 Found capo position: ${guitarCapo}`);
    }
  } else {
    console.log('❌ Capo position not found');
  }
  
  const guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'] = ['E', 'A', 'D', 'G', 'B', 'E']; // Standard tuning default
  
  const result: ChordSheet = {
    songChords,
    songKey,
    guitarTuning,
    guitarCapo,
    title: title || '',
    artist: artist || 'Unknown Artist'
  };
  
  console.log('✅ Final extraction result:', {
    title: result.title,
    artist: result.artist,
    songKey: result.songKey,
    guitarCapo: result.guitarCapo,
    chordsLength: result.songChords.length
  });
  
  return result;
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
