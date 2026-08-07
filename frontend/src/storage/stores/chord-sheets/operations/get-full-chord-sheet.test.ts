/**
 * Tests for getFullChordSheetContent's legacy-format auto-upgrade behavior.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { StoredChordSheet } from "../../../types/stored-chord-sheet";

vi.mock("../database/connection", () => ({
  getDatabase: vi.fn(),
}));

vi.mock("../../../core/transactions", () => ({
  executeReadTransaction: vi.fn(),
  executeWriteTransaction: vi.fn(),
}));

import { getDatabase } from "../database/connection";
import { executeReadTransaction, executeWriteTransaction } from "../../../core/transactions";
import { getFullChordSheetContent } from "./get-full-chord-sheet";

const mockGetDatabase = vi.mocked(getDatabase);
const mockExecuteReadTransaction = vi.mocked(executeReadTransaction);
const mockExecuteWriteTransaction = vi.mocked(executeWriteTransaction);

describe("getFullChordSheetContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDatabase.mockResolvedValue({} as IDBDatabase);
  });

  it("returns ChordPro-format content unchanged and does not write back", async () => {
    const stored: StoredChordSheet = { path: "artist/song", songChords: "{start_of_tab}\nE|---|\n{end_of_tab}" };
    mockExecuteReadTransaction.mockResolvedValueOnce(stored);

    const result = await getFullChordSheetContent("artist/song");

    expect(result).toEqual(stored);
    expect(mockExecuteWriteTransaction).not.toHaveBeenCalled();
  });

  it("migrates legacy positional-format content to ChordPro and writes it back once", async () => {
    const legacy = ["Em7             G", "Today is gonna be the day"].join("\n");
    const stored: StoredChordSheet = { path: "artist/song", songChords: legacy };
    mockExecuteReadTransaction.mockResolvedValueOnce(stored);

    const result = await getFullChordSheetContent("artist/song");

    expect(result?.songChords).toContain("[Em7]");
    expect(result?.songChords).not.toBe(legacy);
    expect(mockExecuteWriteTransaction).toHaveBeenCalledOnce();
  });

  it("returns null when no content exists for the path", async () => {
    mockExecuteReadTransaction.mockResolvedValue(undefined);

    const result = await getFullChordSheetContent("artist/missing-song");

    expect(result).toBeNull();
    expect(mockExecuteWriteTransaction).not.toHaveBeenCalled();
  });
});
