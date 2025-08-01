import { Song } from "@/types/song";
import { ChordSheet } from "@/types/chordSheet";
import { handleSaveNewChordSheetFromUI } from "@/utils/chord-sheet-storage";
import { useNavigate } from "react-router-dom";
import { generateChordSheetPath } from "@/utils/chord-sheet-path";
import { useCallback } from "react";

interface AddToMyChordSheetsData {
  song: Song;
  chordSheet: ChordSheet;
}

export function useAddToMyChordSheets(setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>, setActiveTab?: (tab: string) => void) {
  const navigate = useNavigate();
  
  return useCallback(async (data: AddToMyChordSheetsData) => {
    const { song, chordSheet } = data;
    
    try {
      // Generate chord sheet path from song data (this should match Song.path)
      const chordSheetPath = song.path || generateChordSheetPath(song.artist, song.title);

      // Create complete ChordSheet object for storage
      // Backend now provides accurate title and artist from scraped data
      const fullChordSheet: ChordSheet = {
        title: chordSheet.title || song.title || "Untitled Song",
        artist: chordSheet.artist || song.artist || "Unknown Artist",
        songChords: chordSheet.songChords ?? '',
        songKey: chordSheet.songKey ?? '',
        guitarTuning: chordSheet.guitarTuning ?? ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: chordSheet.guitarCapo ?? 0
      };
      
      // Save chord sheet using the API cache (already cached from fetch)
      
      if (setMySongs && setActiveTab) {
        // User is on home page with state
        handleSaveNewChordSheetFromUI(
          chordSheetPath, 
          fullChordSheet.title, 
          setMySongs, 
          navigate, 
          setActiveTab,
          fullChordSheet.artist
        );
      } else {
        // User is on chord viewer page - use modular chord sheet storage
        const { addChordSheet } = await import('@/utils/chord-sheet-storage');
        
        // Add the chord sheet to My Chord Sheets cache
        addChordSheet(fullChordSheet);
        
        // Show success toast
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: 'Chord sheet added to My Chord Sheets',
          description: `${fullChordSheet.artist} - ${fullChordSheet.title} has been added to your chord sheets.`,
          variant: 'default'
        });
        
        // Redirect to My Chord Sheets tab
        navigate('/my-chord-sheets');
      }
      
    } catch (err) {
      console.error('❌ Error in addToMyChordSheets:', err);
      console.error('💥 Flow failed at step:', err.message);
      throw err;
    }
  }, [navigate, setMySongs, setActiveTab]);
}
