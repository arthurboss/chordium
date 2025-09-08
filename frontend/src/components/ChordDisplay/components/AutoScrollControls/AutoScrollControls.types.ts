export interface AutoScrollControlsProps {
  autoScroll: boolean;
  setAutoScroll: (value: boolean) => void;
  scrollSpeed: number;
  setScrollSpeed: (value: number) => void;
  title?: string;
}
