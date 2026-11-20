import { executeWriteTransaction } from "../../core/transactions";
import { STORES } from "../../core/config/stores";
import type { StoredSongMetadata } from "../../types/stored-song-metadata";
import type { StoredChordSheet } from "../../types/stored-chord-sheet";
import type { StoredLyrics } from "../lyrics-storage";
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  BackupValidationError,
  type BackupSong,
  type ChordiumBackup,
  type ImportResult,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function validateMetadata(value: unknown, index: number): StoredSongMetadata {
  if (!isRecord(value)) {
    throw new BackupValidationError(`Song ${index + 1} has no metadata.`);
  }
  if (!isNonEmptyString(value.path)) {
    throw new BackupValidationError(`Song ${index + 1} has no path.`);
  }
  if (typeof value.title !== "string" || typeof value.artist !== "string") {
    throw new BackupValidationError(`Song ${index + 1} has no title or artist.`);
  }
  if (!isRecord(value.storage)) {
    throw new BackupValidationError(`Song ${index + 1} has no storage metadata.`);
  }
  return value as unknown as StoredSongMetadata;
}

function validateChordSheet(value: unknown, index: number): StoredChordSheet | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value) || typeof value.songChords !== "string") {
    throw new BackupValidationError(`Song ${index + 1} has an invalid chord sheet.`);
  }
  return value as unknown as StoredChordSheet;
}

function validateLyrics(value: unknown, index: number): StoredLyrics | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value) || !isRecord(value.translations)) {
    throw new BackupValidationError(`Song ${index + 1} has invalid lyrics.`);
  }
  return value as unknown as StoredLyrics;
}

function validateSong(value: unknown, index: number): BackupSong {
  if (!isRecord(value)) {
    throw new BackupValidationError(`Song ${index + 1} is malformed.`);
  }
  return {
    metadata: validateMetadata(value.metadata, index),
    chordSheet: validateChordSheet(value.chordSheet, index),
    fullChordSheet: validateChordSheet(value.fullChordSheet, index),
    lyrics: validateLyrics(value.lyrics, index),
  };
}

/**
 * Validates a parsed backup file before anything is written. A malformed file
 * must be rejected whole rather than imported partially.
 */
export function validateBackup(value: unknown): ChordiumBackup {
  if (!isRecord(value)) {
    throw new BackupValidationError("The file is not a Chordium backup.");
  }
  if (value.format !== BACKUP_FORMAT) {
    throw new BackupValidationError("The file is not a Chordium backup.");
  }
  if (typeof value.version !== "number" || !Number.isInteger(value.version) || value.version < 1) {
    throw new BackupValidationError("The backup version is invalid.");
  }
  if (value.version > BACKUP_VERSION) {
    throw new BackupValidationError("The backup was created by a newer version of Chordium.");
  }
  if (!Array.isArray(value.songs)) {
    throw new BackupValidationError("The backup contains no songs.");
  }

  return {
    format: BACKUP_FORMAT,
    version: value.version,
    exportedAt: typeof value.exportedAt === "string" ? value.exportedAt : "",
    songs: value.songs.map(validateSong),
  };
}

export function serializeBackup(backup: ChordiumBackup): string {
  return JSON.stringify(backup, null, 2);
}

/**
 * Restores a backup by upserting every record on its song path. Re-importing
 * the same file is safe. Saved sheets are always restored as saved so the
 * cleanup service cannot evict them.
 */
export async function importBackup(value: unknown): Promise<ImportResult> {
  const backup = validateBackup(value);
  const result: ImportResult = {
    songsImported: 0,
    chordSheetsImported: 0,
    fullChordSheetsImported: 0,
    lyricsImported: 0,
  };

  for (const song of backup.songs) {
    const { metadata } = song;
    const storedMetadata: StoredSongMetadata = {
      ...metadata,
      storage: {
        ...metadata.storage,
        saved: true,
        expiresAt: null,
        contentAvailable: Boolean(song.chordSheet),
      },
    };

    await executeWriteTransaction(STORES.SONGS_METADATA, (store) => store.put(storedMetadata));
    result.songsImported += 1;

    if (song.chordSheet) {
      await executeWriteTransaction(STORES.CHORD_SHEETS, (store) =>
        store.put({ ...song.chordSheet, path: metadata.path })
      );
      result.chordSheetsImported += 1;
    }

    if (song.fullChordSheet) {
      await executeWriteTransaction(STORES.FULL_CHORD_SHEETS, (store) =>
        store.put({ ...song.fullChordSheet, path: metadata.path })
      );
      result.fullChordSheetsImported += 1;
    }

    if (song.lyrics) {
      const storedLyrics: StoredLyrics = {
        path: metadata.path,
        translations: song.lyrics.translations,
        timestamp:
          typeof song.lyrics.timestamp === "number" ? song.lyrics.timestamp : Date.now(),
      };
      await executeWriteTransaction(STORES.SONG_LYRICS, (store) => store.put(storedLyrics));
      result.lyricsImported += 1;
    }
  }

  return result;
}
