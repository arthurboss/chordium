import { Request, Response } from "express";
import cifraClubService from "../../services/cifraclub.service.js";
import logger from "../../utils/logger.js";
import { ErrorResponse, GetChordSheetQuery, SongMetadata } from "../../../shared/types/index.js";

/**
 * Handles requests to fetch song metadata for a given artist/song path.
 * 
 * @param req - Express request object with url query parameter containing path
 * @param res - Express response object
 */
export async function getSongMetadataHandler(
  req: Request<{}, SongMetadata | ErrorResponse, {}, GetChordSheetQuery>,
  res: Response<SongMetadata | ErrorResponse>
): Promise<void> {
  try {
    const { url: pathParam } = req.query;

    // Fetches song metadata for a given artist/song path from CifraClub.
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

    logger.info(`🎵 Fetching song metadata for: ${artist} - ${song}`);
    logger.info(`🔗 CifraClub URL: ${cifraClubUrl}`);
    logger.info(`📊 Flow Step 1: Backend received metadata request for path: ${pathParam}`);

    const metadata = await cifraClubService.getSongMetadata(cifraClubUrl);

    if (!metadata?.title || !metadata?.artist) {
      logger.error(
        `❌ Flow Step 2: No metadata returned from CifraClub service for ${cifraClubUrl}`
      );
      res.status(404).json({ 
        error: "Song metadata not found",
        details: `No metadata found for ${artist} - ${song} at ${cifraClubUrl}`
      });
      return;
    }

    logger.info(`✅ Flow Step 2: Song metadata extracted successfully`);
    logger.info(
      `📝 Title: "${metadata.title}", Artist: "${metadata.artist}"`
    );
    logger.info(
      `🎵 Metadata - Key: ${metadata.songKey || "none"}, Capo: ${metadata.guitarCapo || "none"}, Tuning: ${metadata.guitarTuning ? JSON.stringify(metadata.guitarTuning) : "none"}`
    );
    logger.info(`📤 Flow Step 3: Sending SongMetadata response to frontend`);

    res.json(metadata);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("❌ Error fetching song metadata:", error);

    res
      .status(500)
      .json({ error: "Failed to fetch song metadata", details: errorMessage });
  }
}
