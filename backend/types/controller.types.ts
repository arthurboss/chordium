// Centralized controller handler types and request/response bodies

export interface RemoveSongFromArtistBody {
  artistName?: string;
  songPath?: string;
}

export interface AddSongToArtistBody {
  artistName?: string;
  song?: any; // Use Song from shared types in actual usage
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface GetArtistsQuery {
  artist?: string;
}

export interface GetArtistSongsQuery {
  artistPath?: string;
}

export interface GetChordSheetQuery {
  url?: string;
}
import type { Request, Response } from 'express';

// Import specific types from modular shared types
// (Currently not used but ready for enhanced typing)

// Handler function types - these match the actual JavaScript handler signatures
export type SearchHandler = (req: Request, res: Response) => Promise<void>;
export type ArtistSongsHandler = (req: Request, res: Response) => Promise<void>;
export type ChordSheetHandler = (req: Request, res: Response) => Promise<void>;
export type AddSongHandler = (req: Request, res: Response) => Promise<void>;
export type RemoveSongHandler = (req: Request, res: Response) => Promise<void>;
export type CachedArtistsHandler = (req: Request, res: Response) => Promise<void>;
