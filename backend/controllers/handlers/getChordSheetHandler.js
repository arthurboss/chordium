import cifraClubService from '../../services/cifraclub.service.js';
import logger from '../../utils/logger.js';

/**
 * Handles requests to fetch a chord sheet for a given song URL.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
async function getChordSheetHandler(req, res) {
  // Fetches a chord sheet for a given song URL from CifraClub.
  try {
    const { url } = req.query;
    if (!url) {
      logger.error('❌ getChordSheet: Missing song URL parameter');
      return res.status(400).json({ error: 'Missing song URL' });
    }
    logger.info(`🎵 CHORD SHEET FETCH START: ${url}`);
    logger.info(`📊 Flow Step 1: Backend received chord sheet request`);
    logger.info(`📋 Request Details:`, { url, timestamp: new Date().toISOString() });
    const chordSheet = await cifraClubService.getChordSheet(url);
    if (!chordSheet?.songChords) {
      logger.error(`❌ Flow Step 2: No chord sheet data returned from CifraClub service for ${url}`);
      return res.status(404).json({ error: 'Chord sheet not found' });
    }
    logger.info(`✅ Flow Step 2: Chord sheet data extracted successfully`);
    logger.info(`📏 Chords length: ${chordSheet.songChords.length} characters`);
    logger.info(`📝 Title: "${chordSheet.title}", Artist: "${chordSheet.artist}"`);
    logger.info(`🎵 Metadata - Key: ${chordSheet.songKey || 'none'}, Capo: ${chordSheet.guitarCapo || 'none'}, Tuning: ${chordSheet.guitarTuning ? JSON.stringify(chordSheet.guitarTuning) : 'none'}`);
    logger.info(`📤 Flow Step 3: Sending ChordSheet response to frontend`);
    res.json(chordSheet);
  } catch (error) {
    logger.error('❌ Error fetching chord sheet:', error);
    res.status(500).json({ error: 'Failed to fetch chord sheet', details: error.message });
  }
}

export { getChordSheetHandler };
