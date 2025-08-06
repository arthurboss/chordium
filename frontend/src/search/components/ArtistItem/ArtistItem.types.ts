import { Artist } from "@chordium/types";

export interface ArtistItemProps {
  item: Artist;
  style?: React.CSSProperties;
  onArtistSelect?: (artist: Artist) => void;
}
