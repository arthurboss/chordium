import { SongData } from '../types/song';

// Cache for sample song content - prevent duplicate fetches
let cachedSongs: Promise<SongData[]> | null = null;

export const loadSampleSongs = async (): Promise<SongData[]> => {
  // Return cached promise if available
  if (cachedSongs) {
    return cachedSongs;
  }

  // Create a new promise and cache it
  cachedSongs = (async () => {
    console.log('Loading sample songs (first time)');
    const sampleSong1Content = await fetch("/src/data/songs/wonderwall.txt").then(res =>
      res.text()
    );
    const sampleSong2Content = await fetch(
      "/src/data/songs/hotel-california.txt"
    ).then((res) => res.text());

    const songs = [
      {
        id: "wonderwall",
        title: "Wonderwall",
        artist: "Oasis",
        path: sampleSong1Content,
      },
      { 
        id: "hotel-california", 
        title: "Hotel California", 
        artist: "Eagles", 
        path: sampleSong2Content 
      },
    ];
    
    return songs;
  })();
  
  return cachedSongs;
};
