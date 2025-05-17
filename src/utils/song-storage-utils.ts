import { SongData } from '@/types/song';

// Key for storing songs in localStorage
const SONGS_STORAGE_KEY = 'chordium-songs';

/**
 * Get songs from localStorage
 */
export const getSongs = (): SongData[] => {
  try {
    const songs = localStorage.getItem(SONGS_STORAGE_KEY);
    return songs ? JSON.parse(songs) : [];
  } catch (e) {
    console.error('Failed to get songs from localStorage:', e);
    return [];
  }
};

/**
 * Save songs to localStorage
 */
export const saveSongs = (songs: SongData[]): void => {
  try {
    localStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(songs));
  } catch (e) {
    console.error('Failed to save songs to localStorage:', e);
  }
};

/**
 * Add a new song to the saved songs
 */
export const addSong = (song: SongData): void => {
  const songs = getSongs();
  saveSongs([song, ...songs]);
};

/**
 * Update an existing song
 */
export const updateSong = (updatedSong: SongData): void => {
  const songs = getSongs();
  const updatedSongs = songs.map(song => 
    song.id === updatedSong.id ? updatedSong : song
  );
  saveSongs(updatedSongs);
};

/**
 * Delete a song by ID
 */
export const deleteSong = (songId: string): void => {
  const songs = getSongs();
  const updatedSongs = songs.filter(song => song.id !== songId);
  saveSongs(updatedSongs);
};

/**
 * Get a single song by ID
 */
export const getSongById = (songId: string): SongData | undefined => {
  const songs = getSongs();
  return songs.find(song => song.id === songId);
};
