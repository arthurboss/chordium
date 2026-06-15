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

export interface ChordContentProps {
  rawHtml?: string;
  songChords?: string;
  fontSize: number;
  fontStyle: string;
  isLoading?: boolean;
  viewMode?: string;
}

export interface ChordSheetControlsProps {
  transpose: number;
  setTranspose: (v: number) => void;
  defaultTranspose?: number;
  songKey?: string;
  capo: number;
  setCapo: (v: number) => void;
  defaultCapo?: number;
  fontSize: number;
  setFontSize: (v: number) => void;
  fontStyle: string;
  setFontStyle: (v: string) => void;
  viewMode: string;
  setViewMode: (v: string) => void;
  hideGuitarTabs: boolean;
  setHideGuitarTabs: (v: boolean) => void;
  autoScroll: boolean;
  setAutoScroll: (v: boolean) => void;
  scrollSpeed: number;
  setScrollSpeed: (v: number) => void;
  capoTransposeLinked?: boolean;
  setCapoTransposeLinked?: (v: boolean) => void;
  setIsEditing?: (v: boolean) => void;
  handleDownload?: () => void;
}

export interface ChordEditProps {
  editContent: string;
  setEditContent: (v: string) => void;
  handleSaveEdits: () => void;
  setIsEditing: (v: boolean) => void;
}
