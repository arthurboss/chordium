/**
 * Song domain types - aligned with frontend
 */

export interface Song {
  path: string; // Internal path for navigation/identification
  title: string;
  artist: string; // Artist name
}
