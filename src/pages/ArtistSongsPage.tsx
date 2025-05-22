import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SongData } from '@/types/song';
import { fetchArtistSongs } from '@/utils/artist-utils';
import ArtistSongsResult from '@/components/ArtistSongsResult';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

const ArtistSongsPage: React.FC = () => {
  const { artistPath } = useParams<{ artistPath: string }>();
  const navigate = useNavigate();
  
  const [songs, setSongs] = useState<SongData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSongs = async () => {
      if (!artistPath) {
        setError('Artist path is missing');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const artistSongs = await fetchArtistSongs(artistPath);
        setSongs(artistSongs);
      } catch (err) {
        console.error('Error loading artist songs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load artist songs');
      } finally {
        setLoading(false);
      }
    };
    
    loadSongs();
  }, [artistPath]);

  const handleBackToSearch = () => {
    navigate('/search');
  };
  
  const handleViewSong = (song: SongData) => {
    // Navigate to chord viewer with the appropriate path
    navigate(`/chord/${artistPath}/${song.path}`);
  };
  
  const handleAddSong = (song: SongData) => {
    // Add song to "My Songs" in local storage
    const storageKey = 'chordium-songs';
    const existingSongs = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Check if song is already in "My Songs"
    if (!existingSongs.some((s: SongData) => s.id === song.id)) {
      const updatedSongs = [song, ...existingSongs];
      localStorage.setItem(storageKey, JSON.stringify(updatedSongs));
      // Could add a toast notification here
    }
  };
  
  if (loading) {
    return <LoadingState message={`Loading songs for artist...`} />;
  }
  
  if (error) {
    return <ErrorState message={error} />;
  }
  
  if (!songs || songs.length === 0) {
    return <ErrorState message="No songs found for this artist" />;
  }
  
  return (
    <ArtistSongsResult
      artistSongs={songs}
      onView={handleViewSong}
      onAdd={handleAddSong}
      onBack={handleBackToSearch}
    />
  );
};

export default ArtistSongsPage;
