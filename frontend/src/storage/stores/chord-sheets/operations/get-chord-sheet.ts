/**
 * Retrieves a chord sheet from IndexedDB storage
 */

import type { Song } from "@chordium/types";
import type { StoredSongMetadata } from "../../../types/stored-song-metadata";
import type { StoredChordSheet } from "../../../types/stored-chord-sheet";
import { executeReadTransaction } from "../../../core/transactions";
import { getDatabase } from "../database/connection";
import { resolveSampleChordSheetPath } from "../../../services/sample-chord-sheets/path-resolver";
import { STORES } from "../../../core/config/stores";

/**
 * Gets stored chord sheet metadata by its unique path identifier
 * 
 * @param path - Song path identifier
 * @returns StoredSongMetadata if found, null otherwise
 * @throws {DatabaseOperationError} When storage access fails
 */
export async function getChordSheetMetadata(
  path: Song["path"]
): Promise<StoredSongMetadata | null> {
  // Ensure database initialization to prevent race conditions
  await getDatabase();

  // Try split stores: metadata
  const metadata = await executeReadTransaction<StoredSongMetadata | undefined>(STORES.SONGS_METADATA, (store) => store.get(path));
  if (metadata) {
    return metadata;
  }

  // Try with resolved path for sample chord sheets
  const resolvedPath = resolveSampleChordSheetPath(path);
  if (resolvedPath !== path) {
    const resolvedMetadata = await executeReadTransaction<StoredSongMetadata | undefined>(STORES.SONGS_METADATA, (store) => store.get(resolvedPath));
    if (resolvedMetadata) {
      return resolvedMetadata;
    }
  }

  return null;
}

/**
 * Gets stored chord sheet content by its unique path identifier
 * 
 * @param path - Song path identifier
 * @returns StoredChordSheetContent if found, null otherwise
 * @throws {DatabaseOperationError} When storage access fails
 */
export async function getChordSheetContent(
  path: Song["path"]
): Promise<StoredChordSheet | null> {
  // Ensure database initialization to prevent race conditions
  await getDatabase();

  // Try split stores: content
  const content = await executeReadTransaction<StoredChordSheet | undefined>(STORES.CHORD_SHEETS, (store) => store.get(path));
  if (content) {
    return content;
  }

  // Try with resolved path for sample chord sheets
  const resolvedPath = resolveSampleChordSheetPath(path);
  if (resolvedPath !== path) {
    const resolvedContent = await executeReadTransaction<StoredChordSheet | undefined>(STORES.CHORD_SHEETS, (store) => store.get(resolvedPath));
    if (resolvedContent) {
      return resolvedContent;
    }
  }

  return null;
}

/**
 * Gets both metadata and content for a chord sheet
 * 
 * @param path - Song path identifier
 * @returns Object with metadata and content if found, null otherwise
 * @throws {DatabaseOperationError} When storage access fails
 */
export async function getChordSheetSplit(
  path: Song["path"]
): Promise<{ metadata: StoredSongMetadata; content: StoredChordSheet } | null> {
  const metadata = await getChordSheetMetadata(path);
  const content = await getChordSheetContent(path);
  
  if (metadata && content) {
    return { metadata, content };
  }
  
  return null;
}
