export interface KeyMenuProps {
  transpose: number;
  setTranspose: (value: number) => void;
  defaultTranspose?: number;
  songKey?: string;
  title?: string;
  capoTransposeLinked?: boolean;
  capo?: number;
}

export interface KeyDisplay {
  keyName: string;
  transposeText: string | null;
}
