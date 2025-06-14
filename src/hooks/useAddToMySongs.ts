import { Song } from "@/types/song";
import { ChordSheet } from "@/types/chordSheet";
import { handleSaveNewSong } from "@/utils/song-save";
import { useNavigate } from "react-router-dom";
import { saveChordSheet } from "@/utils/chord-sheet-storage";
import { generateChordSheetId } from "@/utils/chord-sheet-id-generator";
import { useCallback } from "react";

interface AddToMySongsData {
  song: Song;
  chordSheet: ChordSheet;
  content: string; // The actual chord sheet content
}

export function useAddToMySongs(setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>, setActiveTab?: (tab: string) => void) {
  const navigate = useNavigate();
  
  return useCallback(async (data: AddToMySongsData) => {
    const { song, chordSheet, content } = data;
    
    try {
      console.log('🎵 ADD TO MY SONGS START:', song.title, 'by', song.artist);
      console.log('📊 Flow Step 9: User clicked "Add to My Songs"');
      console.log('📋 Song details:', {
        title: song.title,
        artist: song.artist,
        path: song.path,
        timestamp: new Date().toISOString()
      });
      console.log('📦 Backend data received:', {
        hasContent: !!content,
        contentLength: content?.length || 0,
        chordSheetData: {
          title: chordSheet.title,
          artist: chordSheet.artist,
          key: chordSheet.key,
          tuning: chordSheet.tuning,
          capo: chordSheet.capo
        }
      });

      // Generate chord sheet ID from song data (this should match Song.path)
      const chordSheetId = song.path || generateChordSheetId(song.artist, song.title);
      console.log('� Flow Step 10: Using chord sheet ID:', chordSheetId);
      console.log('� ID Generation: Using Song.path directly (no redundant generation)');

      // Create complete ChordSheet object for storage
      const fullChordSheet: ChordSheet = {
        title: song.title || chordSheet.title || "Untitled Song",
        artist: song.artist || chordSheet.artist || "Unknown Artist",
        chords: content || '',
        key: chordSheet.key || '',
        tuning: chordSheet.tuning || '',
        capo: chordSheet.capo || ''
      };
      
      console.log('💾 Flow Step 11: Saving chord sheet content to localStorage');
      console.log('�️  Storage structure:', {
        storageKey: 'chord-sheets',
        chordSheetId,
        dataStructure: {
          title: fullChordSheet.title,
          artist: fullChordSheet.artist,
          chords: `${fullChordSheet.chords.substring(0, 50)}...`,
          key: fullChordSheet.key,
          tuning: fullChordSheet.tuning,
          capo: fullChordSheet.capo
        }
      });

      // Save chord sheet using the new storage system
      saveChordSheet(chordSheetId, fullChordSheet);
      console.log('✅ Flow Step 12: Chord sheet content saved to localStorage');
      
      console.log('💾 Flow Step 13: Saving song metadata (separate from chord content)');
      
      if (setMySongs && setActiveTab) {
        // User is on home page with state
        console.log('🏠 Context: Home page with state management');
        handleSaveNewSong(
          chordSheetId, 
          song.title, 
          setMySongs, 
          navigate, 
          setActiveTab,
          song.artist
        );
      } else {
        // User is on chord viewer page - use unified storage
        console.log('🔍 Context: Chord viewer page - using unified storage');
        const { getSongs, saveSongs, migrateSongsFromOldStorage } = await import('@/utils/unified-song-storage');
        
        // Perform migration if needed to ensure data consistency
        migrateSongsFromOldStorage();
        
        const currentSongs = getSongs();
        console.log('📚 Current songs count:', currentSongs.length);
        
        // Create the new song metadata (path points to chord sheet ID)
        const newSong: Song = {
          title: fullChordSheet.title,
          path: chordSheetId, // This is the key - path is the chord sheet ID
          artist: fullChordSheet.artist
        };
        
        console.log('💾 Saving song metadata:', {
          title: newSong.title,
          artist: newSong.artist,
          path: newSong.path, // This will be used to load chord content later
          note: 'Song.path points to chord sheet ID for content retrieval'
        });
        
        // Save the updated songs list
        saveSongs([newSong, ...currentSongs]);
        console.log('✅ Flow Step 14: Song metadata saved to localStorage');
        
        // Show success toast
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: 'Song added to My Songs',
          description: `${fullChordSheet.artist} - ${fullChordSheet.title} has been added to your songs.`,
          variant: 'default'
        });
        
        // Redirect to My Songs tab
        navigate('/my-songs');
      }
      
      console.log('🎉 COMPLETE FLOW SUMMARY:');
      console.log('1. ✅ Backend scraped chord sheet content');
      console.log('2. ✅ Frontend received minimal backend response: { content: "..." }');
      console.log('3. ✅ Frontend enriched data with Song metadata');
      console.log('4. ✅ Chord sheet content saved to localStorage["chord-sheets"][ID]');
      console.log('5. ✅ Song metadata saved to localStorage["my-songs"] with Song.path = ID');
      console.log('6. ✅ Future retrieval: song.path -> getChordSheet(song.path) -> content');
      console.log('🎉 ADD TO MY SONGS COMPLETE - Full separation achieved!');
      
    } catch (err) {
      console.error('❌ Error in addToMySongs:', err);
      console.error('💥 Flow failed at step:', err.message);
      throw err;
    }
  }, [navigate, setMySongs, setActiveTab]);
}
