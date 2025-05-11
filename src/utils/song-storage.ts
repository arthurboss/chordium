import { SongData } from '../types/song';

export const saveSongs = (songs: SongData[]): void => {
  localStorage.setItem("mySongs", JSON.stringify(songs));
};

export const loadSongs = (initialSongs: SongData[]): SongData[] => {
  const savedSongs = localStorage.getItem("mySongs");
  
  if (savedSongs) { 
    try {
      const parsedSongs = JSON.parse(savedSongs);
      const hasDemoSongs = initialSongs.every(initialSong => 
        parsedSongs.some((parsedSong: SongData) => parsedSong.id === initialSong.id)
      );
      
      if (!hasDemoSongs) {
        const combinedSongs = [...initialSongs, ...parsedSongs];
        saveSongs(combinedSongs);
        return combinedSongs;
      } else {
        return parsedSongs;
      }
    } catch (e) {
      console.error("Error loading saved songs:", e);
      saveSongs(initialSongs);
      return initialSongs;
    }
  }
  
  return initialSongs;
};
