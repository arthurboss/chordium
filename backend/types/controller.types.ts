import type { Request, Response } from 'express';

// Handler function types - these match the actual JavaScript handler signatures
export type SearchHandler = (req: Request, res: Response) => Promise<Response | undefined>;
export type ArtistSongsHandler = (req: Request, res: Response) => Promise<Response | undefined>;
export type ChordSheetHandler = (req: Request, res: Response) => Promise<Response | undefined>;
export type AddSongHandler = (req: Request, res: Response) => Promise<Response | undefined>;
export type RemoveSongHandler = (req: Request, res: Response) => Promise<Response | undefined>;
export type CachedArtistsHandler = (req: Request, res: Response) => Promise<Response | undefined>;
