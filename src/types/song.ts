export interface Song {
  path: string;  // Internal path for navigation/identification
  title: string;
  artist: string; // Always present, extracted from content or context
}
