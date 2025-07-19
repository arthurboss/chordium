import { Request, Response } from 'express';
import cifraClubService from '../../services/cifraclub.service.js';
import logger from '../../utils/logger.js';
import { isValidChordSheetUrl } from '../../utils/url-utils.js';
import type { ErrorResponse, ChordSheet, GetChordSheetQuery } from '../../../packages/types';

/**
 * Handles requests to fetch a chord sheet for a given song URL.
 */
async function getChordSheetHandler(
  req: Request<{}, ChordSheet | ErrorResponse, {}, GetChordSheetQuery>,
  res: Response<ChordSheet | ErrorResponse>
): Promise<void> {
  // Fetches a chord sheet for a given song URL from CifraClub.
  try {
    const { url } = req.query;
    if (!url) {
      logger.error('❌ getChordSheet: Missing song URL parameter');
      res.status(400).json({ error: 'Missing song URL' });
      return;
    }

    logger.info(`🎵 CHORD SHEET FETCH START: ${url}`);
    logger.info(`📊 Flow Step 1: Backend received chord sheet request`);
    logger.info(`📋 Request Details:`, { url, timestamp: new Date().toISOString() });
    
    // Validate URL format before attempting to scrape
    if (!isValidChordSheetUrl(url)) {
      logger.error(`❌ Flow Step 1.5: Invalid chord sheet URL format: ${url}`);
      logger.error(`❌ URL must be a CifraClub URL with exactly 2 path segments (artist/song)`);
      res.status(400).json({ 
        error: 'Invalid chord sheet URL', 
        details: 'URL must be a CifraClub chord sheet URL with format: artist/song' 
      });
      return;
    }

    logger.info(`✅ Flow Step 1.5: URL validation passed - proceeding to scrape`);
    
    const chordSheet = await cifraClubService.getChordSheet(url);
    
    if (!chordSheet?.songChords) {
      logger.error(`❌ Flow Step 2: No chord sheet data returned from CifraClub service for ${url}`);
      res.status(404).json({ error: 'Chord sheet not found' });
      return;
    }

    logger.info(`✅ Flow Step 2: Chord sheet data extracted successfully`);
    logger.info(`📏 Chords length: ${chordSheet.songChords.length} characters`);
    logger.info(`📝 Title: "${chordSheet.title}", Artist: "${chordSheet.artist}"`);
    logger.info(`🎵 Metadata - Key: ${chordSheet.songKey || 'none'}, Capo: ${chordSheet.guitarCapo || 'none'}, Tuning: ${chordSheet.guitarTuning ? JSON.stringify(chordSheet.guitarTuning) : 'none'}`);
    logger.info(`📤 Flow Step 3: Sending ChordSheet response to frontend`);
    
    res.json(chordSheet);
  } catch (error) {
    logger.error('❌ Error fetching chord sheet:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to fetch chord sheet', details: errorMessage });
  }
}

export { getChordSheetHandler };
