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
    
    // Load the actual song content from files
    const hotelCaliforniaResponse = await fetch('/src/data/songs/hotel-california.txt');
    const hotelCaliforniaContent = await hotelCaliforniaResponse.text();
    
    const wonderwallResponse = await fetch('/src/data/songs/wonderwall.txt');
    const wonderwallContent = await wonderwallResponse.text();
    
    const songs = [
      {
        title: "Wonderwall",
        artist: "Oasis", 
        path: wonderwallContent,
      },
      { 
        title: "Hotel California", 
        artist: "Eagles", 
        path: hotelCaliforniaContent,
      },
    ];
    
    return songs;
  })();
  
  return cachedSongs;
};
