import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORES } from "@/storage/core/config/stores";
import { createBackup } from "../export-backup";
import {
  importBackup,
  serializeBackup,
  validateBackup,
} from "../import-backup";
import { BACKUP_FORMAT, BACKUP_VERSION, BackupValidationError, type ChordiumBackup } from "../types";

const mocks = vi.hoisted(() => ({
  read: vi.fn(),
  write: vi.fn(),
}));

vi.mock("@/storage/core/transactions", () => ({
  executeReadTransaction: mocks.read,
  executeWriteTransaction: mocks.write,
}));

const now = 1_750_000_000_000;

function metadata(path: string, saved: boolean) {
  return {
    path,
    title: `Title ${path}`,
    artist: `Artist ${path}`,
    songKey: "C",
    guitarTuning: ["E", "A", "D", "G", "B", "E"],
    guitarCapo: 0,
    storage: {
      timestamp: now,
      version: 1,
      expiresAt: saved ? null : now + 1000,
      saved,
      lastAccessed: now,
      accessCount: 1,
      contentAvailable: true,
    },
  };
}

function backupWith(songs: unknown[]): ChordiumBackup {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: "2026-11-20T00:00:00.000Z",
    songs: songs as ChordiumBackup["songs"],
  };
}

describe("backup validation", () => {
  it("rejects files that are not chordium backups", () => {
    expect(() => validateBackup({ format: "something-else" })).toThrow(BackupValidationError);
    expect(() => validateBackup("nope")).toThrow(BackupValidationError);
  });

  it("rejects backups from a newer version", () => {
    expect(() => validateBackup(backupWith([]))).toBeTruthy();
    expect(() =>
      validateBackup({ ...backupWith([]), version: BACKUP_VERSION + 1 })
    ).toThrow(BackupValidationError);
  });

  it("rejects a song without a path", () => {
    expect(() =>
      validateBackup(backupWith([{ metadata: { title: "x", artist: "y", storage: {} } }]))
    ).toThrow(BackupValidationError);
  });

  it("round-trips through serialization", () => {
    const backup = backupWith([
      {
        metadata: metadata("artist/song", true),
        chordSheet: { path: "artist/song", songChords: "[C]hello" },
      },
    ]);
    expect(validateBackup(JSON.parse(serializeBackup(backup)))).toEqual(backup);
  });
});

describe("createBackup", () => {
  beforeEach(() => {
    mocks.read.mockReset();
  });

  it("exports only saved songs with their content", async () => {
    mocks.read.mockImplementation(async (storeName: string) => {
      if (storeName === STORES.SONGS_METADATA) {
        return [metadata("saved/song", true), metadata("cached/song", false)];
      }
      if (storeName === STORES.CHORD_SHEETS && mocks.read.mock.calls.length > 0) {
        return { path: "saved/song", songChords: "[C]hello" };
      }
      return undefined;
    });

    const backup = await createBackup();

    expect(backup.format).toBe(BACKUP_FORMAT);
    expect(backup.songs).toHaveLength(1);
    expect(backup.songs[0].metadata.path).toBe("saved/song");
    expect(backup.songs[0].chordSheet?.songChords).toBe("[C]hello");
  });
});

describe("importBackup", () => {
  beforeEach(() => {
    mocks.write.mockReset();
    mocks.write.mockResolvedValue(undefined);
  });

  it("restores songs as saved and writes every record", async () => {
    const backup = backupWith([
      {
        metadata: metadata("artist/song", false),
        chordSheet: { path: "artist/song", songChords: "[C]hello" },
        fullChordSheet: { path: "artist/song", songChords: "[C]hello full" },
        lyrics: { path: "artist/song", translations: { de: "hallo" }, timestamp: now },
      },
    ]);

    const result = await importBackup(backup);

    expect(result).toEqual({
      songsImported: 1,
      chordSheetsImported: 1,
      fullChordSheetsImported: 1,
      lyricsImported: 1,
    });
    expect(mocks.write).toHaveBeenCalledTimes(4);

    const metadataCall = mocks.write.mock.calls.find(
      ([store]) => store === STORES.SONGS_METADATA
    );
    const put = vi.fn();
    await metadataCall?.[1]({ put });
    expect(put).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "artist/song",
        storage: expect.objectContaining({ saved: true, expiresAt: null }),
      })
    );
  });
});
