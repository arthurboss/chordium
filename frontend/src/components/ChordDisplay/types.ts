export interface ChordLine {
  type: 'chord' | 'lyrics' | 'tab' | 'empty';
  content: string;
}

export interface ChordSection {
  type: 'section';
  title: string;
  lines: ChordLine[];
}

export interface ChordContentProps {
  processedContent: ChordSection[];
  fontSize: number;
  fontSpacing: number;
  fontStyle: string;
  viewMode: string;
  hideGuitarTabs: boolean;
  renderChord: (chord: string) => React.ReactElement;
}

export interface ChordSheetControlsProps {
  transpose: number;
  setTranspose: (v: number) => void;
  defaultTranspose?: number;
  songKey?: string;
  fontSize: number;
  setFontSize: (v: number) => void;
  fontSpacing: number;
  setFontSpacing: (v: number) => void;
  fontStyle: string;
  setFontStyle: (v: string) => void;
  viewMode: string;
  setViewMode: (v: string) => void;
  autoScroll: boolean;
  setAutoScroll: (v: boolean) => void;
  scrollSpeed: number;
  setScrollSpeed: (v: number) => void;
}

export interface ChordEditProps {
  editContent: string;
  setEditContent: (v: string) => void;
  handleSaveEdits: () => void;
  setIsEditing: (v: boolean) => void;
}