export interface CapoMenuProps {
  capo: number;
  setCapo: (value: number) => void;
  defaultCapo?: number;
  title?: string;
  disableIncrement?: boolean;
  disableDecrement?: boolean;
}
