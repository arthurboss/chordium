import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChordUrl, storeChordUrl } from '@/utils/session-storage-utils';

interface ChordSheetData {
  content: string;
  capo: string;
  tuning: string;
  key: string;
  artist: string;
  song: string;
  loading: boolean;
  error: string | null;
  originalUrl?: string;
}

const initialState: ChordSheetData = {
  content: '',
  capo: '',
  tuning: '',
  key: '',
  artist: '',
  song: '',
  loading: true,
  error: null
};

export function useChordSheet(url?: string) {
  const [chordData, setChordData] = useState<ChordSheetData>(initialState);
  const params = useParams<{ artist?: string; song?: string; id?: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchChordSheet = async () => {
      // If no URL is provided, first check sessionStorage, then try to construct a URL
      let fetchUrl = url;
      
      if (!fetchUrl && params.artist && params.song) {
        // First check if we have a stored URL using our utility function
        const storedUrl = getChordUrl(params.artist, params.song);
        
        if (storedUrl) {
          fetchUrl = storedUrl;
        } else {
          // Reconstruct the URL from artist and song params
          const artistSlug = params.artist.toLowerCase();
          const songSlug = params.song.toLowerCase();
          fetchUrl = `https://www.cifraclub.com.br/${artistSlug}/${songSlug}/`;
        }
      }
      
      if (!fetchUrl) {
        setChordData({
          ...initialState,
          loading: false,
          error: 'Could not find the chord sheet. Please try searching for it again.'
        });
        return;
      }

      setChordData(prev => ({ ...prev, loading: true, originalUrl: fetchUrl }));
      
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/cifraclub-chord-sheet?url=${encodeURIComponent(fetchUrl)}`;
        console.log('Fetching chord sheet from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch chord sheet (${response.status}): ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.content) {
          throw new Error('No chord sheet content found in the response');
        }
        
        // Update URL to artist/song format if needed
        if (data.artist && data.song && 
            (params.artist !== data.artist.toLowerCase().replace(/\s+/g, '-') || 
             params.song !== data.song.toLowerCase().replace(/\s+/g, '-'))) {
          
          const artistSlug = data.artist.toLowerCase().replace(/\s+/g, '-');
          const songSlug = data.song.toLowerCase().replace(/\s+/g, '-');
          
          // Store the original URL in sessionStorage and navigate without URL query parameter
          storeChordUrl(artistSlug, songSlug, fetchUrl);
          navigate(`/chord/${artistSlug}/${songSlug}`, { replace: true });
        }
        
        setChordData({
          content: data.content || '',
          capo: data.capo || '',
          tuning: data.tuning || '',
          key: data.key || '',
          artist: data.artist || '',
          song: data.song || '',
          loading: false,
          error: null,
          originalUrl: fetchUrl
        });
      } catch (err) {
        console.error('Error fetching chord sheet:', err);
        setChordData({
          ...initialState,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load chord sheet',
          originalUrl: fetchUrl
        });
      }
    };
    
    fetchChordSheet();
  }, [url, params.artist, params.song, params.id, navigate]);
  
  return chordData;
}
