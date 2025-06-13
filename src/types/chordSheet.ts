export interface ChordSheet {
  title: string;
  artist: string; // if unavailable, it should be "Unknown Artist"
  
  key?: string;
  tuning?: string;
  capo?: string;
}
