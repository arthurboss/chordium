import { describe, it, expect, vi } from "vitest";
import { storeSampleChordSheets } from "../storage";
import type { SampleChordSheetRecord } from "../data-loader.types";
import type { IChordSheetStorage } from "../types";

const baseMetadata = { title: "Wonderwall", artist: "Oasis", songKey: "G", guitarTuning: ["E", "A", "D", "G", "B", "E"] as [string, string, string, string, string, string], guitarCapo: 0 };

describe("storeSampleChordSheets", () => {
  it("stores each sample's content as saved", async () => {
    const storage: IChordSheetStorage = {
      getAllSaved: vi.fn(),
      store: vi.fn(),
      storeFullContent: vi.fn(),
    };
    const samples: SampleChordSheetRecord[] = [
      { path: "oasis/wonderwall", metadata: baseMetadata, content: { songChords: "simplified content" } },
    ];

    await storeSampleChordSheets(samples, storage);

    expect(storage.store).toHaveBeenCalledWith(baseMetadata, { songChords: "simplified content" }, true, "oasis/wonderwall");
  });

  it("also stores the full arrangement when a sample has one", async () => {
    const storage: IChordSheetStorage = {
      getAllSaved: vi.fn(),
      store: vi.fn(),
      storeFullContent: vi.fn(),
    };
    const fullContent = { songChords: "[TAB]...[/TAB]" };
    const samples: SampleChordSheetRecord[] = [
      { path: "oasis/wonderwall", metadata: baseMetadata, content: { songChords: "simplified content" }, fullContent },
    ];

    await storeSampleChordSheets(samples, storage);

    expect(storage.storeFullContent).toHaveBeenCalledWith(fullContent, "oasis/wonderwall");
  });

  it("does not call storeFullContent when a sample has no full arrangement", async () => {
    const storage: IChordSheetStorage = {
      getAllSaved: vi.fn(),
      store: vi.fn(),
      storeFullContent: vi.fn(),
    };
    const samples: SampleChordSheetRecord[] = [
      { path: "the-eagles/hotel-california", metadata: baseMetadata, content: { songChords: "", rawHtml: "<span>...</span>" } },
    ];

    await storeSampleChordSheets(samples, storage);

    expect(storage.storeFullContent).not.toHaveBeenCalled();
  });

  it("does not throw when the storage adapter has no storeFullContent implementation", async () => {
    const storage: IChordSheetStorage = {
      getAllSaved: vi.fn(),
      store: vi.fn(),
      // storeFullContent intentionally omitted
    };
    const samples: SampleChordSheetRecord[] = [
      { path: "oasis/wonderwall", metadata: baseMetadata, content: { songChords: "simplified content" }, fullContent: { songChords: "[TAB]...[/TAB]" } },
    ];

    await expect(storeSampleChordSheets(samples, storage)).resolves.toBeUndefined();
  });
});
