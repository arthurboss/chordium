import { useCallback } from "react";
import type { Song } from "@chordium/types";
import { useNavigate } from "react-router-dom";
import type { UseSongActionsProps } from "./useSongActions.type";

/**
 * useSongActions provides two main actions:
 * - handleView: Navigates to the chord sheet page for a given song.
 * - handleAdd: Adds a song to the user's "My Chord Sheets" list, avoiding duplicates.
 *
 * @param {Object} props - Props for configuring the hook.
 * @param {Function} [props.setMySongs] - State setter for user's chord sheets.
 * @param {Song[]} props.memoizedSongs - List of songs to operate on.
 * @returns {{ handleView: Function, handleAdd: Function }}
 */
export const useSongActions = ({
  setMySongs,
  memoizedSongs,
}: UseSongActionsProps) => {
  const navigate = useNavigate();

  const handleView = useCallback(
    (songData: Song) => {
      // Navigate directly to chord sheet page using the song's path property
      // Browser history will automatically maintain the navigation stack
      if (songData.path) {
        const targetUrl = `/${songData.path}`;

        navigate(targetUrl, {
          state: { song: songData },
        });
      }
    },
    [navigate]
  );

  const handleAdd = useCallback(
    (songId: string) => {
      if (!setMySongs) return;
      const item = memoizedSongs.find(
        (song) => song.path === songId || song.title === songId
      );
      if (item) {
        // Check if song already exists in My Chord Sheets by path (much cleaner!)
        setMySongs((prev) => {
          const existing = prev.find(
            (existingSong) => existingSong.path === item.path
          );

          if (existing) {
            return prev; // Don't add duplicate
          }

          return [...prev, item];
        });
      }
    },
    [setMySongs, memoizedSongs]
  );

  return {
    handleView,
    handleAdd,
  };
};
