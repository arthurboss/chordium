import { SongData } from "../types/song";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { getSearchParamsType } from "@/utils/search-utils";

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
    switch (path) {
      case "/search":
        setActiveTab("search");
        break;
      case "/upload":
        setActiveTab("upload");
        break;
      case "/my-songs":
      case "/":
        setActiveTab("my-songs");
        break;
    }

    // Use search-utils to check for search params
    if (getSearchParamsType(query)) {
      setActiveTab("search");
    }
  }, [location, mySongs, sampleSongs, setActiveTab, setDemoSong, setSelectedSong]);
};
