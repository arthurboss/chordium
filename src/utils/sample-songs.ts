import { Song } from '../types/song';

// Cache for sample song content - prevent duplicate fetches
let cachedSongs: Promise<Song[]> | null = null;

export const loadSampleSongs = async (): Promise<Song[]> => {
  // Return cached promise if available
  if (cachedSongs) {
    return cachedSongs;
  }

  // Create a new promise and cache it
  cachedSongs = (async () => {
    console.log('Loading sample songs (first time)');
    
    const songs = [
      {
        title: "Wonderwall",
        artist: "Oasis",
        path: "wonderwall",
      },
      { 
        title: "Hotel California", 
        artist: "Eagles", 
        path: "hotel-california"
      },
    ];
    
    return songs;
  })();
  
  return cachedSongs;
};
