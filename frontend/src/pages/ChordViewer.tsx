import { useRef, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SongViewer from "@/components/SongViewer";
import SearchLoadingState from "@/components/SearchResults/SearchLoadingState";
import ErrorState from "@/components/ErrorState";
import NavigationCard from "@/components/NavigationCard";
import { deleteChordSheet } from "@/storage/stores/chord-sheets/operations";
import { toast } from "@/hooks/use-toast";
import { generateChordSheetId } from "@/utils/chord-sheet-id-generator";
import { useChordSheets } from "@/storage/hooks";
import { resolveSampleChordSheetPath } from "@/storage/services/sample-chord-sheets/path-resolver";
import { storedToChordSheet } from "@/storage/services/chord-sheets/conversion";
import type { Song } from "@chordium/types";

const ChordViewer = () => {
  const { artist, song } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  
  // Song object from navigation state (if passed from search results)
  const navigationSong = location.state?.song as Song | undefined;

  // Generate path for chord sheet lookup
  const path = navigationSong?.path || (artist && song ? generateChordSheetId(artist, song) : undefined);

  // Use the main hook that handles database initialization and sample loading
  const { myChordSheets, isLoading, error } = useChordSheets();

  // Find the specific chord sheet, resolving sample paths if needed
  const chordSheet = useMemo(() => {
    if (!path || isLoading) return null;
    
    // First try direct path lookup
    const directMatch = myChordSheets.find(sheet => sheet.path === path);
    if (directMatch?.storage?.saved) {
      return storedToChordSheet(directMatch);
    }
    
    // For samples, try resolved path lookup
    const resolvedPath = resolveSampleChordSheetPath(path);
    const resolvedMatch = myChordSheets.find(sheet => sheet.path === resolvedPath);
    if (resolvedMatch?.storage?.saved) {
      return storedToChordSheet(resolvedMatch);
    }
    
    return null;
  }, [path, myChordSheets, isLoading]);

  const handleBack = () => {
    navigate("/my-chord-sheets");
  };

  const handleDelete = async () => {
    if (!chordSheet || !path) return;
    
    try {
      // Use resolved path for sample chord sheets
      const resolvedPath = resolveSampleChordSheetPath(path);
      await deleteChordSheet(resolvedPath);
      
      toast({
        title: "Chord sheet removed",
        description: `"${chordSheet.title}" has been removed from My Chord Sheets`,
      });
      
      navigate("/my-chord-sheets");
    } catch (error) {
      console.error('Failed to remove chord sheet:', error);
      toast({
        title: "Remove failed",
        description: `Failed to remove "${chordSheet.title}". Please try again.`,
        variant: "destructive"
      });
    }
  };

  if (!path) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <NavigationCard onBack={handleBack} />
          <ErrorState error="Invalid song path" />
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <SearchLoadingState />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || (!isLoading && !chordSheet)) {
    const errorMessage = error instanceof Error ? error.message : error || "Chord sheet not found in saved items";
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
          <NavigationCard onBack={handleBack} />
          <ErrorState error={errorMessage} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
        <NavigationCard 
          onBack={handleBack}
          onDelete={handleDelete}
          showDeleteButton={true}
        />
        <SongViewer
          song={{ 
            song: navigationSong || { 
              ...chordSheet, 
              path: generateChordSheetId(chordSheet.artist, chordSheet.title) 
            }, 
            chordSheet 
          }}
          chordDisplayRef={chordDisplayRef}
          onBack={handleBack}
          onDelete={handleDelete}
          onUpdate={() => {}}
          hideDeleteButton={false}
          hideSaveButton={true}
          isFromMyChordSheets={true}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ChordViewer;
