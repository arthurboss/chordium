import { Request, Response } from "express";
import cifraClubService from "../../services/cifraclub.service.js";
import logger from "../../utils/logger.js";
import { ErrorResponse, GetChordSheetQuery, ChordSheet } from "../../../shared/types/index.js";

/**
 * Handles requests to fetch chord sheet content for a given artist/song path.
 * 
 * @param req - Express request object with url query parameter containing path
 * @param res - Express response object
 */
export async function getChordSheetHandler(
  req: Request<Record<string, never>, ChordSheet | ErrorResponse, Record<string, never>, GetChordSheetQuery>,
  res: Response<ChordSheet | ErrorResponse>
): Promise<void> {
  try {
    const { url: pathParam } = req.query;

    // Fetches chord sheet content for a given artist/song path from CifraClub.
    // Expected path format: "artist/song" (e.g., "radiohead/creep")
    if (!pathParam || typeof pathParam !== "string") {
      logger.warn("⚠️ Missing or invalid song path parameter");
      res.status(400).json({ 
        error: "Missing song path parameter", 
        details: "Expected path format: artist/song (e.g., radiohead/creep)" 
      });
      return;
    }

    // Parse the path to extract artist and song
    const pathParts = pathParam.trim().split('/');
    if (pathParts.length !== 2 || !pathParts[0] || !pathParts[1]) {
      logger.warn("⚠️ Invalid song path format:", pathParam);
      res.status(400).json({ 
        error: "Invalid song path format", 
        details: `Expected path format: artist/song (e.g., radiohead/creep). Received: ${pathParam}`
      });
      return;
    }

    const [artist, song] = pathParts;
    
    // Construct CifraClub URL from artist and song
    const cifraClubUrl = `https://www.cifraclub.com.br/${encodeURIComponent(artist)}/${encodeURIComponent(song)}/`;

    logger.info(`🎵 Fetching chord sheet content for: ${artist} - ${song}`);
    logger.info(`🔗 CifraClub URL: ${cifraClubUrl}`);
    logger.info(`📊 Flow Step 1: Backend received chord sheet content request for path: ${pathParam}`);

    const chordSheetContent = await cifraClubService.getChordSheet(cifraClubUrl);

    if (!chordSheetContent?.songChords) {
      logger.error(
        `❌ Flow Step 2: No chord sheet content returned from CifraClub service for ${cifraClubUrl}`
      );
      res.status(404).json({ 
        error: "Chord sheet content not found",
        details: `No chord sheet content found for ${artist} - ${song} at ${cifraClubUrl}`
      });
      return;
    }

    logger.info(`✅ Flow Step 2: Chord sheet content extracted successfully`);
    logger.info(`📏 Chords length: ${chordSheetContent.songChords.length} characters`);
    logger.info(`📤 Flow Step 3: Sending ChordSheetContent response to frontend`);

    res.json(chordSheetContent);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("❌ Error fetching chord sheet content:", error);

    res
      .status(500)
      .json({ error: "Failed to fetch chord sheet content", details: errorMessage });
  }
}
