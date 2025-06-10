export interface Song {
  path: string;  // Internal path for navigation/identification
  title: string;
  artist?: string; // Optional since search results may not always have artist
  key?: string;
  tuning?: string;
  capo?: string;
}
