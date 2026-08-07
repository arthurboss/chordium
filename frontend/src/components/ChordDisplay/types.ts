import type { ReactNode } from 'react';

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
}

export interface ChordEditProps {
  editContent: string;
  setEditContent: (v: string) => void;
  handleSaveEdits: () => void;
  setIsEditing: (v: boolean) => void;
  /** Font size (px) and family, matching the read-only display's current settings. */
  fontSize?: number;
  fontFamily?: string;
  /** Rendered next to the full-screen toggle, e.g. a full/simplified arrangement indicator. */
  arrangementIndicator?: ReactNode;
}
