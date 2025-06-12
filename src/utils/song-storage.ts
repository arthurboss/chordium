import { Song } from '../types/song';

export const saveSongs = (songs: Song[]): void => {
  localStorage.setItem("mySongs", JSON.stringify(songs));
};

export const loadSongs = (initialSongs: Song[]): Song[] => {
  const savedSongs = localStorage.getItem("mySongs");
  
  if (savedSongs) { 
    try {
      const parsedSongs = JSON.parse(savedSongs);
      const hasDemoSongs = initialSongs.every(initialSong => 
        parsedSongs.some((parsedSong: Song) => parsedSong.path === initialSong.path)
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
