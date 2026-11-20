import type { StoredSongMetadata } from "../../types/stored-song-metadata";
import type { StoredChordSheet } from "../../types/stored-chord-sheet";
import type { StoredLyrics } from "../lyrics-storage";

export const BACKUP_FORMAT = "chordium-backup";
export const BACKUP_VERSION = 1;

export interface BackupSong {
  metadata: StoredSongMetadata;
  chordSheet?: StoredChordSheet;
  fullChordSheet?: StoredChordSheet;
  lyrics?: StoredLyrics;
}

export interface ChordiumBackup {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  songs: BackupSong[];
}

export interface ImportResult {
  songsImported: number;
  chordSheetsImported: number;
  fullChordSheetsImported: number;
  lyricsImported: number;
}

export class BackupValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackupValidationError";
  }
}
