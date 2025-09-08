export interface KeyMenuProps {
  transpose: number;
  setTranspose: (value: number) => void;
  defaultTranspose?: number;
  songKey?: string;
  title?: string;
  disableIncrement?: boolean;
  disableDecrement?: boolean;
}

export interface KeyDisplay {
  keyName: string;
  transposeText: string | null;
}
