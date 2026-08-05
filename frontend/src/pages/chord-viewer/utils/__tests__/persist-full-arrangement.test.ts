import { describe, it, expect, vi } from "vitest";
import { persistFullArrangementOnSave } from "../persist-full-arrangement";

describe("persistFullArrangementOnSave", () => {
  it("stores the already-fetched full arrangement immediately, without fetching", () => {
    const storeFullChordSheet = vi.fn().mockResolvedValue(undefined);
    const fetchFullSongFromAPI = vi.fn();
    const fullContent = { songChords: "[TAB]...[/TAB]" };

    persistFullArrangementOnSave("john-mayer/gravity", true, fullContent, {
      storeFullChordSheet,
      fetchFullSongFromAPI,
    });

    expect(storeFullChordSheet).toHaveBeenCalledWith(fullContent, "john-mayer/gravity");
    expect(fetchFullSongFromAPI).not.toHaveBeenCalled();
  });

  it("fetches and stores the full arrangement in the background when not yet fetched", async () => {
    const storeFullChordSheet = vi.fn().mockResolvedValue(undefined);
    const fullFromApi = { songChords: "[TAB]...[/TAB]", rawHtml: "<pre>...</pre>" };
    const fetchFullSongFromAPI = vi.fn().mockResolvedValue(fullFromApi);

    persistFullArrangementOnSave("john-mayer/gravity", false, null, {
      storeFullChordSheet,
      fetchFullSongFromAPI,
    });

    expect(fetchFullSongFromAPI).toHaveBeenCalledWith("john-mayer/gravity");
    await vi.waitFor(() => {
      expect(storeFullChordSheet).toHaveBeenCalledWith(fullFromApi, "john-mayer/gravity");
    });
  });

  it("does not store anything when the background fetch finds no full arrangement", async () => {
    const storeFullChordSheet = vi.fn().mockResolvedValue(undefined);
    const fetchFullSongFromAPI = vi.fn().mockResolvedValue(null);

    persistFullArrangementOnSave("ac-dc/back-in-black", false, null, {
      storeFullChordSheet,
      fetchFullSongFromAPI,
    });

    await vi.waitFor(() => {
      expect(fetchFullSongFromAPI).toHaveBeenCalled();
    });
    expect(storeFullChordSheet).not.toHaveBeenCalled();
  });

  it("does not throw when the background fetch rejects", async () => {
    const storeFullChordSheet = vi.fn();
    const fetchFullSongFromAPI = vi.fn().mockRejectedValue(new Error("network error"));

    expect(() =>
      persistFullArrangementOnSave("john-mayer/gravity", false, null, {
        storeFullChordSheet,
        fetchFullSongFromAPI,
      })
    ).not.toThrow();

    await vi.waitFor(() => {
      expect(fetchFullSongFromAPI).toHaveBeenCalled();
    });
    expect(storeFullChordSheet).not.toHaveBeenCalled();
  });

  it("does not store or fetch when hasFullArrangement is true but content is inconsistently missing", () => {
    const storeFullChordSheet = vi.fn();
    const fetchFullSongFromAPI = vi.fn();

    persistFullArrangementOnSave("john-mayer/gravity", true, null, {
      storeFullChordSheet,
      fetchFullSongFromAPI,
    });

    expect(storeFullChordSheet).not.toHaveBeenCalled();
    expect(fetchFullSongFromAPI).not.toHaveBeenCalled();
  });
});
