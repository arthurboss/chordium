import { Song } from "@/types/song";
import { ChordSheet } from "@/types/chordSheet";
import { handleSaveNewChordSheetFromUI } from "@/utils/chord-sheet-storage";
import { useNavigate } from "react-router-dom";
import { generateChordSheetId } from "@/utils/chord-sheet-id-generator";
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
      console.log('🎵 ADD TO MY CHORD SHEETS START:', song.title, 'by', song.artist);
      console.log('📊 Flow Step 9: User clicked "Add to My Chord Sheets"');
      console.log('📋 Song details:', {
        title: song.title,
        artist: song.artist,
        path: song.path,
        timestamp: new Date().toISOString()
      });
      console.log('📦 Backend data received:', {
        hasChords: !!chordSheet.songChords,
        chordsLength: chordSheet.songChords?.length ?? 0,
        chordSheetData: {
          title: chordSheet.title,
          artist: chordSheet.artist,
          songKey: chordSheet.songKey,
          guitarTuning: chordSheet.guitarTuning,
          guitarCapo: chordSheet.guitarCapo
        }
      });

      // Generate chord sheet ID from song data (this should match Song.path)
      const chordSheetId = song.path || generateChordSheetId(song.artist, song.title);
      console.log('🔑 Flow Step 10: Using chord sheet ID:', chordSheetId);
      console.log('🔑 ID Generation: Using Song.path directly (no redundant generation)');

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
      
      console.log('💾 Flow Step 11: Saving chord sheet content to localStorage');
      console.log('🗄️ Storage structure:', {
        storageKey: 'chord-sheets',
        chordSheetId,
        dataStructure: {
          title: fullChordSheet.title,
          artist: fullChordSheet.artist,
          songChords: `${fullChordSheet.songChords.substring(0, 50)}...`,
          songKey: fullChordSheet.songKey,
          guitarTuning: fullChordSheet.guitarTuning,
          guitarCapo: fullChordSheet.guitarCapo
        }
      });

      // Save chord sheet using the API cache (already cached from fetch)
      console.log('✅ Flow Step 12: Chord sheet already cached in API cache');
      
      console.log('💾 Flow Step 13: Saving chord sheet metadata (separate from chord content)');
      
      if (setMySongs && setActiveTab) {
        // User is on home page with state
        console.log('🏠 Context: Home page with state management');
        handleSaveNewChordSheetFromUI(
          chordSheetId, 
          fullChordSheet.title, 
          setMySongs, 
          navigate, 
          setActiveTab,
          fullChordSheet.artist
        );
      } else {
        // User is on chord viewer page - use modular chord sheet storage
        console.log('🔍 Context: Chord viewer page - using modular chord sheet storage');
        const { addChordSheet } = await import('@/utils/chord-sheet-storage');
        
        console.log('🎧 Adding chord sheet to My Chord Sheets cache:', {
          title: fullChordSheet.title,
          artist: fullChordSheet.artist,
          contentLength: fullChordSheet.songChords.length
        });
        
        // Add the chord sheet to My Chord Sheets cache
        addChordSheet(fullChordSheet);
        
        console.log('✅ Flow Step 14: Chord sheet added to My Chord Sheets cache');
        
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
      
      console.log('🎉 COMPLETE FLOW SUMMARY:');
      console.log('1. ✅ Backend scraped chord sheet data');
      console.log('2. ✅ Frontend received ChordSheet response from backend');
      console.log('3. ✅ Chord sheet data cached in API cache with 1-day TTL');
      console.log('4. ✅ Chord sheet metadata saved to localStorage["my-chord-sheets"] with Song.path = ID');
      console.log('5. ✅ Future retrieval: song.path -> API cache lookup -> chordSheet');
      console.log('🎉 ADD TO MY CHORD SHEETS COMPLETE - Using single API cache for chord sheets!');
      
    } catch (err) {
      console.error('❌ Error in addToMyChordSheets:', err);
      console.error('💥 Flow failed at step:', err.message);
      throw err;
    }
  }, [navigate, setMySongs, setActiveTab]);
}
