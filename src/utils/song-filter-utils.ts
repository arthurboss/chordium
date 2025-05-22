// Utility to filter songs by title (case-insensitive)
import { SongData } from '@/types/song';

export function filterSongsByTitle(songs: SongData[], filter: string): SongData[] {
  if (!filter) return songs;
  const normalized = filter.toLowerCase();
  return songs.filter(song => song.title.toLowerCase().includes(normalized));
}
