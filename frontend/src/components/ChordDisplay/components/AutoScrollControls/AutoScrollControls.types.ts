export interface AutoScrollControlsProps {
  autoScroll: boolean;
  // toggleAutoScroll may accept an optional enable flag and a flag
  // indicating we should start from the #chord-display position when beginning.
  toggleAutoScroll: (enable?: boolean, startFromChordDisplay?: boolean) => void;
  scrollSpeed: number;
  setScrollSpeed: (value: number) => void;
  title?: string;
}
