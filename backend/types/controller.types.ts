import type { Request, Response } from "express";
import { ChordSheet, ErrorResponse, GetChordSheetQuery } from '../../shared/types/index.js';

export type SearchHandler = (req: Request, res: Response) => Promise<void>;
export type ArtistSongsHandler = (req: Request, res: Response) => Promise<void>;
export type ChordSheetHandler = (
  req: Request<Record<string, never>, ChordSheet | ErrorResponse, Record<string, never>, GetChordSheetQuery>,
  res: Response<ChordSheet | ErrorResponse>
) => Promise<void>;
