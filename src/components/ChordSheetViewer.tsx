import { useParams } from 'react-router-dom';
import { useChordSheet } from '@/hooks/useChordSheet';
import ChordDisplay from '@/components/ChordDisplay';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import SongChordDetails from '@/components/SongChordDetails';

const ChordSheetViewer = () => {
  const params = useParams<{ artist?: string; song?: string }>();
  // No longer using search params to get URL - useChordSheet will handle this
  const chordData = useChordSheet();
  
  // Combine data for display
  const title = chordData.song || '';
  const artist = chordData.artist || '';
  const content = chordData.content;
  
  if (chordData.loading) {
    return <LoadingState message="Loading chord sheet..." />;
  }
  
  if (chordData.error) {
    return <ErrorState error={`Failed to load chord sheet: ${chordData.error}`} />;
  }
  
  return (
    <>
      <SongChordDetails 
        songKey={chordData.key}
        tuning={chordData.tuning}
        capo={chordData.capo}
      />
      <ChordDisplay 
        title={title} 
        artist={artist} 
        content={content} 
      />
    </>
  );
};

export default ChordSheetViewer;
