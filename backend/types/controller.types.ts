// Centralized controller handler types and request/response bodies

import type { Request, Response } from "express";
import { ChordSheetRequest, ChordSheetResponse, ErrorResponse, SuccessResponse, RemoveSongFromArtistBody } from '../../packages/types/dist';

// Handler function types - these match the actual JavaScript handler signatures
export type SearchHandler = (req: Request, res: Response) => Promise<void>;
export type ArtistSongsHandler = (req: Request, res: Response) => Promise<void>;
export type ChordSheetHandler = (req: Request, res: Response) => Promise<void>;
export type AddSongHandler = (req: Request, res: Response) => Promise<void>;
export type RemoveSongHandler = (
  req: Request<Record<string, never>, SuccessResponse | ErrorResponse, RemoveSongFromArtistBody>,
  res: Response<SuccessResponse | ErrorResponse>
) => Promise<void>;
export type CachedArtistsHandler = (
  req: Request,
  res: Response
) => Promise<void>;
