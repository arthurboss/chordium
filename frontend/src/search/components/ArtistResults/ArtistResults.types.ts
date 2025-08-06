import { Artist } from "@chordium/types";

export interface ArtistResultsProps {
  artists: Artist[];
  onArtistSelect?: (artist: Artist) => void;
}
