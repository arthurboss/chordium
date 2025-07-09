import { useEffect } from "react";

/**
 * Calls the provided refresh function whenever the active tab changes to 'my-chord-sheets'.
 * @param activeTab The current active tab
 * @param refreshMySongs Function to refresh the user's chord sheets
 */
export function useRefreshMyChordSheets(activeTab: string, refreshMySongs: () => void) {
  useEffect(() => {
    if (activeTab === 'my-chord-sheets') {
      refreshMySongs();
    }
  }, [activeTab, refreshMySongs]);
}
