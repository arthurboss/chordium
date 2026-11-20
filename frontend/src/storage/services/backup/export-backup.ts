import { executeReadTransaction } from "../../core/transactions";
import { STORES } from "../../core/config/stores";
import type { StoredSongMetadata } from "../../types/stored-song-metadata";
import type { StoredChordSheet } from "../../types/stored-chord-sheet";
import type { StoredLyrics } from "../lyrics-storage";
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  type BackupSong,
  type ChordiumBackup,
} from "./types";

/**
 * Collects every user-saved chord sheet, including the optional full
 * arrangement and cached lyric translations, into a portable snapshot.
 */
export async function createBackup(): Promise<ChordiumBackup> {
  const allMetadata = await executeReadTransaction<StoredSongMetadata[]>(
    STORES.SONGS_METADATA,
    (store) => store.getAll()
  );

  const savedMetadata = allMetadata.filter(
    (record) =>
      record?.storage?.saved === true && typeof record.path === "string" && record.path.length > 0
  );

  const songs: BackupSong[] = [];

  for (const metadata of savedMetadata) {
    const chordSheet = await executeReadTransaction<StoredChordSheet | undefined>(
      STORES.CHORD_SHEETS,
      (store) => store.get(metadata.path)
    );
    const fullChordSheet = await executeReadTransaction<StoredChordSheet | undefined>(
      STORES.FULL_CHORD_SHEETS,
      (store) => store.get(metadata.path)
    );
    const lyrics = await executeReadTransaction<StoredLyrics | undefined>(
      STORES.SONG_LYRICS,
      (store) => store.get(metadata.path)
    );

    songs.push({
      metadata,
      ...(chordSheet ? { chordSheet } : {}),
      ...(fullChordSheet ? { fullChordSheet } : {}),
      ...(lyrics ? { lyrics } : {}),
    });
  }

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    songs,
  };
}
