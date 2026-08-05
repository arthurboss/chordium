import { describe, it, expect, vi } from 'vitest';
import { handleIndexedDBMigrations } from '../migration-handler';
import { STORES } from '../../../../../core/config/stores';

/**
 * Regression tests for the v6 migration.
 *
 * Content scraped before the truncation fix is silently cut short, and cached
 * content is served without ever re-fetching, so it would never self-heal.
 * v6 drops it. Saved songs must survive: the content store also holds user
 * edits, and nothing distinguishes an edit from a plain cache entry.
 */

interface MetaRecord {
  path: string;
  storage: { saved: boolean; contentAvailable?: boolean };
}

/** Minimal cursor-walking object store over an in-memory record list. */
function createMetadataStore(records: MetaRecord[]) {
  const updated: MetaRecord[] = [];
  const store = {
    openCursor() {
      const request: { onsuccess: ((e: unknown) => void) | null } = { onsuccess: null };
      // Drive the cursor once a handler is attached, mimicking IDB's async walk.
      queueMicrotask(() => {
        let i = 0;
        const step = () => {
          if (!request.onsuccess) return;
          const cursor =
            i < records.length
              ? {
                  value: records[i],
                  update: (v: MetaRecord) => updated.push(v),
                  continue: () => {
                    i++;
                    step();
                  },
                }
              : null;
          request.onsuccess({ target: { result: cursor } });
        };
        step();
      });
      return request;
    },
  };
  return { store, updated };
}

function createDb(storeNames: string[]) {
  const names = [...storeNames];
  return {
    objectStoreNames: { contains: (n: string) => names.includes(n) },
    // Stubs for the schema migrations (v2-v5) that run when upgrading from an
    // older version on the way to v6.
    deleteObjectStore: (n: string) => {
      const i = names.indexOf(n);
      if (i >= 0) names.splice(i, 1);
    },
    createObjectStore: (n: string) => {
      names.push(n);
      return { createIndex: () => undefined };
    },
  } as unknown as IDBDatabase;
}

function createTransaction(stores: Record<string, unknown>) {
  return {
    objectStore: (name: string) => stores[name],
  } as unknown as IDBTransaction;
}

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

describe('handleIndexedDBMigrations — v6 cached-content reset', () => {
  it('deletes content for unsaved songs so it is re-fetched', async () => {
    const { store: metadataStore } = createMetadataStore([
      { path: 'oasis/wonderwall', storage: { saved: false } },
    ]);
    const content = { delete: vi.fn() };
    const full = { delete: vi.fn() };

    handleIndexedDBMigrations(
      createDb([STORES.SONGS_METADATA, STORES.CHORD_SHEETS, STORES.FULL_CHORD_SHEETS]),
      5,
      6,
      createTransaction({
        [STORES.SONGS_METADATA]: metadataStore,
        [STORES.CHORD_SHEETS]: content,
        [STORES.FULL_CHORD_SHEETS]: full,
      })
    );
    await flush();

    expect(content.delete).toHaveBeenCalledWith('oasis/wonderwall');
    expect(full.delete).toHaveBeenCalledWith('oasis/wonderwall');
  });

  it('preserves saved songs, which may hold user edits', async () => {
    const { store: metadataStore, updated } = createMetadataStore([
      { path: 'extreme/more-than-words', storage: { saved: true } },
    ]);
    const content = { delete: vi.fn() };
    const full = { delete: vi.fn() };

    handleIndexedDBMigrations(
      createDb([STORES.SONGS_METADATA, STORES.CHORD_SHEETS, STORES.FULL_CHORD_SHEETS]),
      5,
      6,
      createTransaction({
        [STORES.SONGS_METADATA]: metadataStore,
        [STORES.CHORD_SHEETS]: content,
        [STORES.FULL_CHORD_SHEETS]: full,
      })
    );
    await flush();

    expect(content.delete).not.toHaveBeenCalled();
    expect(full.delete).not.toHaveBeenCalled();
    expect(updated).toHaveLength(0);
  });

  it('clears contentAvailable so metadata does not claim content it lost', async () => {
    const { store: metadataStore, updated } = createMetadataStore([
      { path: 'oasis/wonderwall', storage: { saved: false, contentAvailable: true } },
    ]);

    handleIndexedDBMigrations(
      createDb([STORES.SONGS_METADATA, STORES.CHORD_SHEETS]),
      5,
      6,
      createTransaction({
        [STORES.SONGS_METADATA]: metadataStore,
        [STORES.CHORD_SHEETS]: { delete: vi.fn() },
      })
    );
    await flush();

    expect(updated).toHaveLength(1);
    expect(updated[0].storage.contentAvailable).toBe(false);
  });

  it('sorts a mixed library, dropping only the unsaved entries', async () => {
    const { store: metadataStore } = createMetadataStore([
      { path: 'a/cached', storage: { saved: false } },
      { path: 'b/saved', storage: { saved: true } },
      { path: 'c/cached', storage: { saved: false } },
    ]);
    const content = { delete: vi.fn() };

    handleIndexedDBMigrations(
      createDb([STORES.SONGS_METADATA, STORES.CHORD_SHEETS]),
      5,
      6,
      createTransaction({
        [STORES.SONGS_METADATA]: metadataStore,
        [STORES.CHORD_SHEETS]: content,
      })
    );
    await flush();

    expect(content.delete.mock.calls.flat()).toEqual(['a/cached', 'c/cached']);
  });

  it('is a no-op without a transaction rather than throwing', async () => {
    const { store: metadataStore } = createMetadataStore([
      { path: 'a/cached', storage: { saved: false } },
    ]);

    expect(() =>
      handleIndexedDBMigrations(createDb([STORES.SONGS_METADATA, STORES.CHORD_SHEETS]), 5, 6, null)
    ).not.toThrow();
    await flush();
    expect(metadataStore).toBeDefined();
  });

  it('runs for users upgrading from older versions, not just v5', async () => {
    const { store: metadataStore } = createMetadataStore([
      { path: 'a/cached', storage: { saved: false } },
    ]);
    const content = { delete: vi.fn() };

    // A v3 user jumping straight to v6 still needs the stale cache dropped.
    handleIndexedDBMigrations(
      createDb([STORES.SONGS_METADATA, STORES.CHORD_SHEETS, STORES.FULL_CHORD_SHEETS]),
      3,
      6,
      createTransaction({
        [STORES.SONGS_METADATA]: metadataStore,
        [STORES.CHORD_SHEETS]: content,
        [STORES.FULL_CHORD_SHEETS]: { delete: vi.fn() },
      })
    );
    await flush();

    expect(content.delete).toHaveBeenCalledWith('a/cached');
  });
});
