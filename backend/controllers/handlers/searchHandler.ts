import { Request, Response } from 'express';
import { buildSearchQuery, determineSearchType } from '../../utils/search.utils.js';
import cifraClubService from '../../services/cifraclub.service.js';
import logger from '../../utils/logger.js';
import type { SearchType } from "../../../shared/types/index.js";

export async function searchHandler(req: Request, res: Response): Promise<void> {
  try {
    const { artist, song } = req.query;
    const query = buildSearchQuery(artist as string, song as string);
    const searchType = determineSearchType(artist as string, song as string);

    if (!query || !searchType) {
      res.status(400).json({ error: 'Missing or invalid search query' });
      return;
    }

    logger.info(`Search request - query: "${query}", type: ${searchType}`);
    const results = await cifraClubService.search(query, searchType as SearchType);
    res.json(results);
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      details: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    });
  }
}
