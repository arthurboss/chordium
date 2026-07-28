import type { ChordSheet } from '@/types/chordSheet';

export interface TransposeCapoControls {
  transpose: number;
  defaultTranspose: number;
  handleTransposeChange: (v: number) => void;
  getTransposeDisableStates: () => { disableIncrement: boolean; disableDecrement: boolean };
  capo: number;
  defaultCapo: number;
  handleCapoChange: (v: number) => void;
  getCapoDisableStates: () => { disableIncrement: boolean; disableDecrement: boolean };
  songKey?: string;
}

export interface MetadataEditControls {
  songKey: string;
  guitarTuning: string;
  guitarCapo: number;
  onSongKeyChange: (v: string) => void;
  onGuitarTuningChange: (v: string) => void;
  onGuitarCapoChange: (v: number) => void;
}

export interface ChordMetadataProps {
  chordSheet: ChordSheet;
  controls?: TransposeCapoControls;
  edit?: MetadataEditControls;
}
