import { Song } from "@chordium/types";

/**
 * Filter songs by title with case-insensitive matching
 */
export const filterArtistSongsByTitle = (songs: Song[], filter: string): Song[] => {
  if (!filter) return songs;
  return songs.filter((song) =>
    song.title.toLowerCase().includes(filter.toLowerCase())
  );
};
