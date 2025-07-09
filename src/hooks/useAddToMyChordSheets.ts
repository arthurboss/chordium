import { saveChordSheet } from "@/cache/utils/saveChordSheet";
import { ChordSheet } from "@/types/chordSheet";
import { Song } from "@/types/song";
import { handleSaveNewChordSheetFromUI } from "@/cache";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export function useAddToMyChordSheets(
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>,
  setActiveTab?: (tab: string) => void
) {
  const navigate = useNavigate();

  return useCallback(
    async (chordSheet: ChordSheet, path: string) => {
      try {
        console.log("📋 ChordSheet details:", {
          title: chordSheet.title,
          artist: chordSheet.artist,
          path: path,
          timestamp: new Date().toISOString(),
        });

        // CRITICAL: Use the path as the IndexedDB key - NO path reconstruction!
        console.log(
          "🔑 Flow Step 10: Using path as IndexedDB key (NO reconstruction):",
          path
        );

        console.log("📦 Backend data received:", {
          hasChords: !!chordSheet.songChords,
          chordsLength: chordSheet.songChords?.length ?? 0,
          chordSheetData: {
            title: chordSheet.title,
            artist: chordSheet.artist,
            songKey: chordSheet.songKey,
            guitarTuning: chordSheet.guitarTuning,
            guitarCapo: chordSheet.guitarCapo,
            path: path,
          },
        });

        // ChordSheet object is already complete from backend
        console.log(
          "💾 Flow Step 11: Saving chord sheet content to cache using path"
        );
        console.log("🗄️ Storage structure:", {
          path,
          dataStructure: {
            title: chordSheet.title,
            artist: chordSheet.artist,
            songChords: `${chordSheet.songChords.substring(0, 50)}...`,
            songKey: chordSheet.songKey,
            guitarTuning: chordSheet.guitarTuning,
            guitarCapo: chordSheet.guitarCapo,
          },
        });

        console.log(
          "💾 Flow Step 13: Saving chord sheet using path as cache key"
        );

        if (setMySongs && setActiveTab) {
          // User is on home page with state
          console.log("🏠 Context: Home page with state management");

          // Pass the path to prevent reconstruction
          handleSaveNewChordSheetFromUI(
            path,
            chordSheet.songChords,
            chordSheet.title,
            setMySongs,
            navigate,
            setActiveTab,
            chordSheet.artist
          );
        } else {
          // User is on chord viewer page - use direct cache storage with path
          console.log(
            "🔍 Context: Chord viewer page - using direct cache storage with path"
          );

          console.log(
            "🎧 Adding chord sheet to My Chord Sheets (IndexedDB) using path:",
            {
              title: chordSheet.title,
              artist: chordSheet.artist,
              path: path,
              contentLength: chordSheet.songChords.length,
            }
          );

          // Store in cache using the path - this is the key fix!
          await saveChordSheet(path, chordSheet, {
            saved: true,
          });

          console.log(
            "✅ Flow Step 14: Chord sheet added to IndexedDB storage using path"
          );

          // Show success toast
          const { toast } = await import("@/hooks/use-toast");
          toast({
            title: "Chord sheet added to My Chord Sheets",
            description: `${chordSheet.artist} - ${chordSheet.title} has been added to your chord sheets.`,
            variant: "default",
          });

          // Redirect to My Chord Sheets tab
          navigate("/my-chord-sheets");
        }
      } catch (err) {
        console.error("❌ Error in addToMyChordSheets:", err);
        console.error("💥 Flow failed at step:", err.message);
        throw err;
      }
    },
    [navigate, setMySongs, setActiveTab]
  );
}
