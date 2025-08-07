import { Artist, Song } from "@chordium/types";
import type { SearchResult } from "../SearchResultsLayout/SearchResultsLayout.types";

type UIState =
  | { state: "loading" }
  | { state: "error"; error: Error }
  | { state: "artist-songs-loading"; activeArtist: Artist | null }
  | {
      state: "artist-songs-error";
      artistSongsError: string;
      activeArtist: Artist | null;
    }
  | { state: "artist-songs-empty"; activeArtist: Artist }
  | {
      state: "songs-view";
      activeArtist?: Artist;
      searchType: "artist" | "song";
      hasSongs: boolean;
    }
  | { state: "hasSearched"; hasSongs: boolean }
  | { state: "default" };

export interface SearchResultsStateHandlerProps {
  stateData: UIState;
  results: SearchResult[];
  onResultClick: (item: SearchResult) => void;
}
