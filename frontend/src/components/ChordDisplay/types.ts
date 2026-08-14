export interface ChordLine {
  type: 'chord' | 'lyrics' | 'tab' | 'empty';
  content: string;
}

export interface ChordSection {
  type: 'section';
  title: string;
  lines: ChordLine[];
  isTabSection?: boolean;
}

export interface ChordSheetControlsProps {
  autoScroll: boolean;
  setAutoScroll: (v: boolean) => void;
  scrollSpeed: number;
  setScrollSpeed: (v: number) => void;
  handleDownload?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  canInterleave?: boolean;
  isInterleaved?: boolean;
  onToggleInterleave?: () => void;
}

export interface ChordEditProps {
  editContent: string;
  setEditContent: (v: string) => void;
  handleSaveEdits: () => void;
  setIsEditing: (v: boolean) => void;
}
