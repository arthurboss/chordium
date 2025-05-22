import { SongData } from "../types/song";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { getSearchParamsType } from "@/utils/search-utils";

interface TabNavigationProps {
  sampleSongs: SongData[];
  mySongs: SongData[];
  setActiveTab: (tab: string) => void;
  activeTab: string; // Added: current activeTab from Home's state
  setDemoSong: React.Dispatch<React.SetStateAction<SongData | null>>;
  setSelectedSong: React.Dispatch<React.SetStateAction<SongData | null>>;
}

export const useTabNavigation = ({
  sampleSongs,
  mySongs,
  setActiveTab,
  activeTab, // Consumed here
  setDemoSong,
  setSelectedSong
}: TabNavigationProps): void => {
  const location = useLocation();
  
  useEffect(() => {
    const currentPath = location.pathname;
    const queryParams = new URLSearchParams(location.search);
    const songIdFromQuery = queryParams.get("song");

    let determinedTab: string;

    // Determine the tab based on the current path and search parameters
    if (currentPath.startsWith("/search") || getSearchParamsType(queryParams)) {
      determinedTab = "search";
    } else if (currentPath.startsWith("/upload")) {
      determinedTab = "upload";
    } else if (currentPath.startsWith("/artist/")) {
      determinedTab = "search"; // Show artist songs in search tab
    } else if (currentPath.startsWith("/my-songs") || currentPath === "/") {
      determinedTab = "my-songs";
    } else {
      // Fallback for unknown paths, default to "my-songs"
      // This case should ideally be handled by a 404 route in App.tsx
      determinedTab = "my-songs"; 
    }
    
    // Only call setActiveTab if the determined tab is different from the current state
    if (activeTab !== determinedTab) {
      setActiveTab(determinedTab);
    }

    // Handle song selection if a song ID is in query params AND the determined tab is "my-songs"
    // This prevents trying to load a song if the user is, for example, on the "/search" or "/upload" tab.
    if (songIdFromQuery && determinedTab === "my-songs") {
      let songFound = false;
      // Check sample songs only if sampleSongs array is available and has items
      if (sampleSongs && sampleSongs.length > 0) {
        const foundDemo = sampleSongs.find((song) => song.id === songIdFromQuery);
        if (foundDemo) {
          setDemoSong({ ...foundDemo } as SongData);
          setSelectedSong(null); // Clear other selection
          songFound = true;
        }
      }

      // If not found in demo songs, check user's songs (if available and has items)
      if (!songFound && mySongs && mySongs.length > 0) {
        const foundMySong = mySongs.find(song => song.id === songIdFromQuery);
        if (foundMySong) {
          setSelectedSong(foundMySong);
          setDemoSong(null); // Clear other selection
          songFound = true; 
        }
      }

      // Optional: If songIdFromQuery was present but no song was found, clear selections.
      // This might be too aggressive depending on desired UX.
      // if (!songFound) {
      //   setDemoSong(null);
      //   setSelectedSong(null);
      // }
    }
    // Note: Clearing demoSong/selectedSong when songIdFromQuery is NOT present,
    // or when the tab changes, is largely handled by TabContainer's onValueChange logic
    // and the natural flow of selecting/deselecting songs.

  }, [location, sampleSongs, mySongs, setActiveTab, activeTab, setDemoSong, setSelectedSong]); // Added activeTab to dependency array
};
