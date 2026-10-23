/**
 * Deterministic key for a list/path membership row.
 *
 * Using `${listId}::${path}` as the IndexedDB key means adding the same
 * song to the same list twice is a plain `put` overwrite rather than a
 * duplicate row, so callers never need a read-before-write existence check.
 */
export default function itemId(listId: string, path: string): string {
  return `${listId}::${path}`;
}
