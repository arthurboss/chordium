import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSearchResultsViewModel } from "../useSearchResultsViewModel";
import type { SearchHit, Song } from "@chordium/types";

const baseParams = {
  isDefault: true,
  activeArtist: null,
  hits: [] as SearchHit[],
  artistSongs: null,
  filteredArtistSongs: [] as Song[],
  handleView: vi.fn(),
  handleArtistSelect: vi.fn(),
};

const song = (artist: string): Song => ({
  title: "Sublime",
  path: "florianopolis-house-of-prayer/sublime",
  artist,
});

function openArtist(displayName: string, path: string, songs: Song[]) {
  return {
    ...baseParams,
    activeArtist: { displayName, path, songCount: songs.length },
    artistSongs: songs,
    filteredArtistSongs: songs,
  };
}

describe("useSearchResultsViewModel", () => {
  it("prefers a confirmed activeArtist.displayName over the song's scraped artist", () => {
    const { result } = renderHook(() =>
      useSearchResultsViewModel(
        openArtist("Florianópolis House Of Prayer (fhop music)", "florianopolis-house-of-prayer", [
          song("Florianopolis House Of Prayer"),
        ])
      )
    );

    expect(result.current.results[0]).toMatchObject({ artist: "Florianópolis House Of Prayer (fhop music)" });
  });

  it("falls back to the song's scraped artist when activeArtist.displayName is just the slug guess", () => {
    const { result } = renderHook(() =>
      useSearchResultsViewModel(openArtist("ac dc", "ac-dc", [song("AC/DC")]))
    );

    expect(result.current.results[0]).toMatchObject({ artist: "AC/DC" });
  });

  it("falls back to the slug-derived name when neither a confirmed displayName nor a scraped artist is available", () => {
    const { result } = renderHook(() =>
      useSearchResultsViewModel(openArtist("ac dc", "ac-dc", [song("")]))
    );

    expect(result.current.results[0]).toMatchObject({ artist: "ac dc" });
  });

  it("returns a search's artists and songs in the order the source ranked them", () => {
    const hits: SearchHit[] = [
      { type: "artist", displayName: "Eagles", path: "the-eagles", songCount: null },
      { type: "song", title: "Hotel California", artist: "Eagles", path: "the-eagles/hotel-california" },
    ];

    const { result } = renderHook(() =>
      useSearchResultsViewModel({ ...baseParams, hits })
    );

    expect(result.current.results).toEqual(hits);
  });

  it("opens a chord sheet for a song and an artist's songs for an artist", () => {
    const handleView = vi.fn();
    const handleArtistSelect = vi.fn();
    const artistHit: SearchHit = { type: "artist", displayName: "Eagles", path: "the-eagles", songCount: null };
    const songHit: SearchHit = { type: "song", title: "Hotel California", artist: "Eagles", path: "the-eagles/hotel-california" };

    const { result } = renderHook(() =>
      useSearchResultsViewModel({ ...baseParams, hits: [artistHit, songHit], handleView, handleArtistSelect })
    );

    result.current.onResultClick(songHit);
    expect(handleView).toHaveBeenCalledWith(songHit);

    result.current.onResultClick(artistHit);
    expect(handleArtistSelect).toHaveBeenCalledWith(artistHit);
  });
});
