import type { Song } from "@chordium/types";

export interface SearchDataState {
  artist: string;
  song: string;
  results: Song[];
}
