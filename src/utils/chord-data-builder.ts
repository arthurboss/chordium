import { ChordSheetData } from '../hooks/useChordSheet';
import { LocalSongResult } from './local-song-finder';

/**
 * Builds ChordSheetData from a local song result
 * Follows SRP: Single responsibility of data transformation
 * 
 * @param localSong - The local song result to transform
 * @returns ChordSheetData - Formatted data for the chord sheet component
 */
export function buildChordSheetData(localSong: LocalSongResult): ChordSheetData {
  return {
    content: localSong.path,
    artist: localSong.artist,
    song: localSong.title,
    key: localSong.key,
    tuning: localSong.tuning,
    capo: localSong.capo,
    loading: false,
    error: null
  };
}
