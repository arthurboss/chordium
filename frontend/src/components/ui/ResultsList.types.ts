export interface ResultsListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (props: {
    item: T;
    index: number;
    style?: React.CSSProperties;
  }) => React.ReactNode;
  virtualizationThreshold?: number;
  fallbackClassName?: string;
}
