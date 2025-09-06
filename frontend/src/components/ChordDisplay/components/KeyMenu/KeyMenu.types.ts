export interface KeyMenuProps {
  transpose: number;
  setTranspose: (value: number) => void;
  defaultTranspose?: number;
  songKey?: string;
}

export interface KeyDisplay {
  keyName: string;
  transposeText: string | null;
}
