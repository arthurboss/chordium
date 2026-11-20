import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import type { ChordiumBackup } from "../types";
import { BACKUP_FORMAT, BACKUP_VERSION } from "../types";

const now = 1_760_000_000_000;

function metadata(path: string, title: string, artist: string) {
  return {
    path,
    title,
    artist,
    songKey: "C",
    guitarTuning: ["E", "A", "D", "G", "B", "E"] as ["E", "A", "D", "G", "B", "E"],
    guitarCapo: 0,
    storage: {
      timestamp: now,
      version: 1,
      expiresAt: null,
      saved: true,
      lastAccessed: now,
      accessCount: 1,
      contentAvailable: true,
    },
  };
}

const backup: ChordiumBackup = {
  format: BACKUP_FORMAT,
  version: BACKUP_VERSION,
  exportedAt: "2026-11-20T00:00:00.000Z",
  songs: [
    {
      metadata: metadata("oasis/wonderwall", "Wonderwall", "Oasis"),
      chordSheet: { path: "oasis/wonderwall", songChords: "[Intro] Em7  G" },
      fullChordSheet: { path: "oasis/wonderwall", songChords: "[Intro] Em7  G  D4" },
      lyrics: { path: "oasis/wonderwall", translations: { de: "Heute" }, timestamp: now },
    },
    {
      metadata: metadata("radiohead/creep", "Creep", "Radiohead"),
      chordSheet: { path: "radiohead/creep", songChords: "[Intro] G  B  C  Cm" },
    },
  ],
};

function deleteDatabase(): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase("chordium-v1");
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
}

describe("backup round trip through IndexedDB", () => {
  it("restores every store and exports the same records", async () => {
    await deleteDatabase();

    const { importBackup } = await import("../import-backup");
    const { createBackup } = await import("../export-backup");

    const result = await importBackup(backup);
    expect(result).toEqual({
      songsImported: 2,
      chordSheetsImported: 2,
      fullChordSheetsImported: 1,
      lyricsImported: 1,
    });

    const exported = await createBackup();
    expect(exported.format).toBe(BACKUP_FORMAT);
    expect(exported.songs.map((song) => song.metadata.path).sort()).toEqual([
      "oasis/wonderwall",
      "radiohead/creep",
    ]);

    const wonderwall = exported.songs.find(
      (song) => song.metadata.path === "oasis/wonderwall"
    );
    expect(wonderwall?.chordSheet?.songChords).toBe("[Intro] Em7  G");
    expect(wonderwall?.fullChordSheet?.songChords).toBe("[Intro] Em7  G  D4");
    expect(wonderwall?.lyrics?.translations).toEqual({ de: "Heute" });
    expect(wonderwall?.metadata.storage.saved).toBe(true);
  });
});
