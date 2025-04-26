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
  viewMode: string;
  hideGuitarTabs: boolean;
  renderChord: (chord: string) => JSX.Element;
}

export interface ChordSheetControlsProps {
  transpose: number;
  setTranspose: (v: number) => void;
  transposeOptions: number[];
  fontSize: number;
  setFontSize: (v: number) => void;
  viewMode: string;
  setViewMode: (v: string) => void;
  hideGuitarTabs: boolean;
  setHideGuitarTabs: (v: boolean) => void;
  autoScroll: boolean;
  setAutoScroll: (v: boolean) => void;
  scrollSpeed: number;
  setScrollSpeed: (v: number) => void;
  setIsEditing: (v: boolean) => void;
  handleDownload: () => void;
}

export interface ChordEditProps {
  editContent: string;
  setEditContent: (v: string) => void;
  handleSaveEdits: () => void;
  setIsEditing: (v: boolean) => void;
} 