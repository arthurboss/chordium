/**
 * Resolves the simplified arrangement's current songChords when saving an
 * edit to the full arrangement.
 *
 * The simplified content must come from `editedData` (the last-saved
 * simplified edit this session) before falling back to the fallback hook's
 * loaded content, since that content is only populated once on mount and
 * never refreshed after a save - reading it directly would silently revert
 * a simplified edit that was saved earlier in the same session.
 */
export function resolveSimplifiedContentForFullEdit(
  editedSongChords: string | undefined,
  loadedSongChords: string | undefined
): string {
  return editedSongChords ?? loadedSongChords ?? '';
}
