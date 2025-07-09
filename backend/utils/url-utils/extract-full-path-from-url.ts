import { URL } from 'url';
import logger from '../logger.js';

/**
 * Extracts the full path from a CifraClub URL
 */
export function extractFullPathFromUrl(url: string): string | null {
  try {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      logger.debug('Extract full path failed: Invalid URL input', { url });
      return null;
    }

    const urlObj = new URL(url.trim());
    const fullPath = urlObj.pathname.replace(/(^\/+|\/+$)/g, '');
    
    // Handle root path case
    if (!fullPath || fullPath === '') {
      return '';
    }
    
    return fullPath;
  } catch (error) {
    logger.debug('Extract full path failed: URL parsing error', { 
      url, 
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}
