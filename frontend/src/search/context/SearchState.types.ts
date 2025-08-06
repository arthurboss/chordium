import type { Song } from "@chordium/types";

export interface SearchState {
  artist: string;
  song: string;
  results: Song[];
}
