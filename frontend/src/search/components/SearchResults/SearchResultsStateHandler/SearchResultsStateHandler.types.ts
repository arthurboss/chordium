import { Artist, Song } from "@chordium/types";

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
      artistSongs?: Song[];
      songs?: Song[];
      searchType: "artist" | "song";
      hasSongs: boolean;
    }
  | { state: "hasSearched"; hasSongs: boolean }
  | { state: "default" };

export interface SearchResultsStateHandlerProps {
  stateData: UIState;
  artists: Artist[];
  songs: Song[];
  filteredSongs: Song[];
  filterSong: string;
  filterArtist?: string; // <-- add this
  onView: (songData: Song) => void;
  onAdd: (songId: string) => void;
  onArtistSelect: (artist: Artist) => void;
}
