import { Song } from "@chordium/types";

export interface SongItemProps {
  item: Song;
  onView: (song: Song) => void;
  onDelete: (songId: string) => void;
  style?: React.CSSProperties;
}
