export interface ResultsListProps<T> {
  items: T[];
  renderItem: (props: {
    item: T;
    index: number;
    style?: React.CSSProperties;
  }) => React.ReactNode;
}
