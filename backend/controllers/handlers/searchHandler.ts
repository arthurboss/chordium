import { Request, Response } from 'express';
import cifraClubService from '../../services/cifraclub.service.js';
import logger from '../../utils/logger.js';

export async function searchHandler(req: Request, res: Response): Promise<void> {
  const { q } = req.query;
  const query = typeof q === 'string' ? q.trim() : '';

  if (!query) {
    res.status(400).json({ error: 'Missing search query' });
    return;
  }

  try {
    const results = await cifraClubService.search(query);
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
