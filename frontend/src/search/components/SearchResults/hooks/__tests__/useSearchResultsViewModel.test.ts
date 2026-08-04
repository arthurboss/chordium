import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSearchResultsViewModel } from "../useSearchResultsViewModel";
import type { Song } from "@chordium/types";

const baseParams = {
  isDefault: true,
  searchType: "artist" as const,
  artists: [],
  songs: [],
  filterArtist: "",
  filterSong: "",
  handleView: vi.fn(),
  handleArtistSelect: vi.fn(),
};

const song = (artist: string): Song => ({
  title: "Sublime",
  path: "florianopolis-house-of-prayer/sublime",
  artist,
});

describe("useSearchResultsViewModel", () => {
  it("prefers a confirmed activeArtist.displayName over the song's scraped artist", () => {
    const { result } = renderHook(() =>
      useSearchResultsViewModel({
        ...baseParams,
        activeArtist: { displayName: "Florianópolis House Of Prayer (fhop music)", path: "florianopolis-house-of-prayer", songCount: 156 },
        artistSongs: [song("Florianopolis House Of Prayer")],
      })
    );

    expect(result.current.results[0]).toMatchObject({ artist: "Florianópolis House Of Prayer (fhop music)" });
  });

  it("falls back to the song's scraped artist when activeArtist.displayName is just the slug guess", () => {
    const { result } = renderHook(() =>
      useSearchResultsViewModel({
        ...baseParams,
        activeArtist: { displayName: "ac dc", path: "ac-dc", songCount: 237 },
        artistSongs: [song("AC/DC")],
      })
    );

    expect(result.current.results[0]).toMatchObject({ artist: "AC/DC" });
  });

  it("falls back to the slug-derived name when neither a confirmed displayName nor a scraped artist is available", () => {
    const { result } = renderHook(() =>
      useSearchResultsViewModel({
        ...baseParams,
        activeArtist: { displayName: "ac dc", path: "ac-dc", songCount: 237 },
        artistSongs: [song("")],
      })
    );

    expect(result.current.results[0]).toMatchObject({ artist: "ac dc" });
  });
});
