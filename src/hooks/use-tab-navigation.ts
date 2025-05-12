import { SongData } from "../types/song";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

interface TabNavigationProps {
  sampleSongs: SongData[];
  mySongs: SongData[];
  setActiveTab: (tab: string) => void;
  setDemoSong: React.Dispatch<React.SetStateAction<SongData | null>>;
  setSelectedSong: React.Dispatch<React.SetStateAction<SongData | null>>;
}

export const useTabNavigation = ({
  sampleSongs,
  mySongs,
  setActiveTab,
  setDemoSong,
  setSelectedSong
}: TabNavigationProps): void => {
  const location = useLocation();
  
  useEffect(() => {
    if (!sampleSongs.length) return;
    
    // Handle URL parameters and navigation
    const query = new URLSearchParams(location.search);
    const songId = query.get("song");
    
    if (songId) {
      const foundDemo = sampleSongs.find((song) => song.id === songId);
      if (foundDemo) {
        setDemoSong({
          ...foundDemo,
        } as SongData);
        setActiveTab("my-songs");
        return;
      }
      
      const foundMySong = mySongs.find(song => song.id === songId);
      if (foundMySong) {
        setSelectedSong(foundMySong);
        setActiveTab("my-songs");
        return;
      }
    }
    
    // Set active tab based on URL path
    const path = location.pathname;
    if (path === "/search") {
      setActiveTab("search");
    } else if (path === "/upload") {
      setActiveTab("upload");
    } else if (path === "/my-songs" || path === "/") {
      setActiveTab("my-songs");
    }
    
    // Additional handling for query parameters
    if (query.get("q")) {
      setActiveTab("search");
    }
  }, [location, mySongs, sampleSongs, setActiveTab, setDemoSong, setSelectedSong]);
};
