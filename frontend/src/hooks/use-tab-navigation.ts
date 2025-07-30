import { Song } from "@chordium/types";
import type { StoredChordSheet } from "@/storage/types";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { getSearchParamsType } from "@/search/utils";

interface TabNavigationProps {
  myChordSheets: StoredChordSheet[];
  setActiveTab: (tab: string) => void;
  activeTab: string; // Added: current activeTab from Home's state
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>;
}

/**
 * Determines which tab should be active based on the current path and query parameters
 */
const determineActiveTab = (
  path: string,
  queryParams: URLSearchParams
): string => {
  // Handle path-based routing first - paths take priority over query parameters
  switch (true) {
    case path.startsWith("/upload"):
      return "upload";

    case path.startsWith("/my-chord-sheets"):
      // This includes /my-chord-sheets/artist/song routes - should stay in my-chord-sheets tab
      // Path-based routing takes priority over query parameters for My Chord Sheets
      return "my-chord-sheets";

    case path.startsWith("/search"):
      // Explicit search path
      return "search";

    case path.startsWith("/artist/"):
      // Artist songs from search results - show in search tab
      return "search";

    case path === "/":
      // Root path defaults to my-chord-sheets
      return "my-chord-sheets";

    default: {
      // Handle artist routes: /artist-name (single segment paths)
      const pathSegments = path
        .split("/")
        .filter((segment) => segment.length > 0);
      if (pathSegments.length === 1 && pathSegments[0] !== "") {
        // This is likely an artist page, show search tab with artist selected
        return "search";
      }

      // Handle search context based on query parameters only for non-specific paths
      if (getSearchParamsType(queryParams)) {
        return "search";
      }

      // Fallback for unknown paths, default to "my-chord-sheets"
      return "my-chord-sheets";
    }
  }
};

/**
 * Handles song selection logic for My Chord Sheets tab
 */
const handleSongSelection = (
  songIdFromQuery: string,
  determinedTab: string,
  myChordSheets: StoredChordSheet[],
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>
): void => {
  // Only handle song selection if we're in my-chord-sheets tab
  if (determinedTab !== "my-chord-sheets") {
    return;
  }

  // Check user's songs (includes sample chord sheets in dev mode)
  if (myChordSheets?.length > 0) {
    const foundStoredChordSheet = myChordSheets.find(
      (chordSheet) => chordSheet.path === songIdFromQuery
    );
    if (foundStoredChordSheet) {
      // Extract Song fields for navigation (no conversion, just type projection)
      const songForNavigation: Song = {
        path: foundStoredChordSheet.path,
        title: foundStoredChordSheet.title,
        artist: foundStoredChordSheet.artist,
      };
      setSelectedSong(songForNavigation);
      return;
    }
  }

  // Song not found - clear selection
  setSelectedSong(null);
};

export const useTabNavigation = ({
  myChordSheets,
  setActiveTab,
  activeTab, // Consumed here
  setSelectedSong,
}: TabNavigationProps): void => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const queryParams = new URLSearchParams(location.search);
    const songIdFromQuery = queryParams.get("song");

    // Determine the tab based on the current path and search parameters
    const determinedTab = determineActiveTab(currentPath, queryParams);

    // Update active tab if it has changed
    if (activeTab !== determinedTab) {
      setActiveTab(determinedTab);
    }

    // Handle song selection for My Chord Sheets tab
    if (songIdFromQuery) {
      handleSongSelection(
        songIdFromQuery,
        determinedTab,
        myChordSheets,
        setSelectedSong
      );
    }
  }, [location, myChordSheets, setActiveTab, activeTab, setSelectedSong]);
};
