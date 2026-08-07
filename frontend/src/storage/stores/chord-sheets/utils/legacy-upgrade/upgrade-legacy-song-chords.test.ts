import { describe, it, expect, vi } from "vitest";

vi.mock("../../../../core/transactions", () => ({
  executeWriteTransaction: vi.fn(),
}));

import { executeWriteTransaction } from "../../../../core/transactions";
import { upgradeLegacySongChords } from "./upgrade-legacy-song-chords";
import type { StoredChordSheet } from "../../../../types/stored-chord-sheet";

const mockExecuteWriteTransaction = vi.mocked(executeWriteTransaction);

describe("upgradeLegacySongChords", () => {
  it("returns the record unchanged and does not write when songChords is already ChordPro format", async () => {
    const content: StoredChordSheet = { path: "a/b", songChords: "[G]Saying I love you" };

    const result = await upgradeLegacySongChords("chordSheets", content);

    expect(result).toEqual(content);
    expect(mockExecuteWriteTransaction).not.toHaveBeenCalled();
  });

  it("migrates legacy positional songChords to ChordPro and writes the upgraded record back", async () => {
    const legacy = ["[Intro]", "Em7             G", "Today is gonna be the day"].join("\n");
    const content: StoredChordSheet = { path: "a/b", songChords: legacy };

    const result = await upgradeLegacySongChords("chordSheets", content);

    expect(result.songChords).not.toBe(legacy);
    expect(result.songChords).toContain("{comment: Intro}");
    expect(result.path).toBe("a/b");
    expect(mockExecuteWriteTransaction).toHaveBeenCalledOnce();
    expect(mockExecuteWriteTransaction).toHaveBeenCalledWith("chordSheets", expect.any(Function));
  });

  it("still migrates songChords when rawHtml is present, even though rawHtml takes rendering priority", async () => {
    const legacy = ["Em7             G", "Today is gonna be the day"].join("\n");
    const content: StoredChordSheet = { path: "a/b", songChords: legacy, rawHtml: "<b>Em7</b>..." };

    const result = await upgradeLegacySongChords("chordSheets", content);

    expect(result.rawHtml).toBe("<b>Em7</b>...");
    expect(result.songChords).toContain("[Em7]");
    expect(mockExecuteWriteTransaction).toHaveBeenCalledOnce();
  });
});
