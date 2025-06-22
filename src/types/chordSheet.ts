import { GuitarTuning } from "./guitarTuning";

export interface ChordSheet {
  title: Required<string>; // Song title. Must be provided.
  artist: string; // if unavailable, it should be "Unknown Artist"
  songChords: string; // The actual chord sheet content, can be a string of chords or lyrics with chords
  songKey: string; // Empty string if not available
  guitarTuning: GuitarTuning;
  guitarCapo: number; // Capo position, 0 if not available since it is the default value
}


/** 
 * ✅ CACHE ALIGNMENT COMPLETED:
 * 
 * - [x] cache: chordium-chord-sheet-cache (for scraped/external songs only)
 * - [x] cache: chordium-user-saved-songs (for user-saved songs, includes sample songs in dev mode)
 * - [x] sample songs (loaded directly from files, not cached in external cache)
 * - [x] fetched songs (properly cached in external cache)
 * 
 * CACHE STRUCTURE:
 * {
    "key": "artist_name-song_title",
    "data": {
        "title": "Song Title",
        "artist": "Artist Name",
        "songChords": "chord content...",
        "songKey": "G",
        "guitarTuning": ["E", "A", "D", "G", "B", "E"],
        "guitarCapo": 0
    },
    "timestamp": 1750584849950,
    "accessCount": 5
}
 */
