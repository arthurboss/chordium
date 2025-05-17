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
      let isStoredUrl = false;
      let isReconstructedUrl = false;
      
      if (!fetchUrl && params.artist && params.song) {
        // First check if we have a stored URL using our utility function
        const storedUrl = getChordUrl(params.artist, params.song);
        
        if (storedUrl) {
          fetchUrl = storedUrl;
          isStoredUrl = true;
          console.log('Using stored URL from session storage:', fetchUrl);
        } else {
          // Reconstruct the URL from artist and song params
          const artistSlug = params.artist.toLowerCase();
          const songSlug = params.song.toLowerCase();
          fetchUrl = `https://www.cifraclub.com.br/${artistSlug}/${songSlug}/`;
          isReconstructedUrl = true;
          console.log('Reconstructed URL from params:', fetchUrl);
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
        // Validate URL format before sending to backend
        try {
          new URL(fetchUrl);
        } catch (e) {
          throw new Error('Invalid URL format. Please ensure the URL includes http:// or https://');
        }
        
        const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/cifraclub-chord-sheet?url=${encodeURIComponent(fetchUrl)}`;
        console.log('Fetching chord sheet from backend:', apiUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
          const response = await fetch(apiUrl, { 
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('Song not found. Please check the artist and song name and try again.');
            } else if (response.status === 429) {
              throw new Error('Too many requests. Please try again later.');
            } else {
              throw new Error(`Failed to fetch chord sheet (${response.status}): ${response.statusText}`);
            }
          }
          
          const data = await response.json();
          
          if (data.error) {
            throw new Error(`Backend error: ${data.error}`);
          }
          
          if (!data.content) {
            throw new Error('No chord sheet content found. This song may not be available.');
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
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          // Re-throw fetch errors for the outer catch block
          throw fetchErr;
        }
      } catch (err) {
        console.error('Error fetching chord sheet:', err);
        
        // Provide more user-friendly error messages
        let errorMessage: string;
        
        if (err instanceof DOMException && err.name === 'AbortError') {
          errorMessage = 'Request timed out. The server might be busy or the connection is slow.';
        } else if (err instanceof Error) {
          errorMessage = err.message;
        } else {
          errorMessage = 'Failed to load chord sheet. Please try again later.';
        }
        
        // If we're using a reconstructed URL and it fails, add a hint
        if (isReconstructedUrl) {
          errorMessage += ' (Note: Using a URL reconstructed from the artist and song parameters)';
        }
        
        setChordData({
          ...initialState,
          loading: false,
          error: errorMessage,
          originalUrl: fetchUrl
        });
      }
    };
    
    fetchChordSheet();
  }, [url, params.artist, params.song, params.id, navigate]);
  
  return chordData;
}
