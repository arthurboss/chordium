import React from 'react';
import VirtualizedListWithArrow from '@/components/ui/VirtualizedListWithArrow';
import { ResultsListProps } from './ResultsList.types';

/**
 * Generic results list wrapper.
 * Uses virtualization if items.length >= virtualizationThreshold.
 */
export function ResultsList<T>({
  items,
  itemHeight,
  renderItem,
  virtualizationThreshold = 30,
  fallbackClassName = 'grid grid-cols-1 gap-y-2',
}: Readonly<ResultsListProps<T>>) {
  if (!items || items.length === 0) return null;

  const isVirtualized = items.length >= virtualizationThreshold;

  if (isVirtualized) {
    return (
      <VirtualizedListWithArrow
        items={items}
        itemHeight={itemHeight}
        renderItem={({ index, style }: { index: number; style: React.CSSProperties }) =>
          renderItem({ item: items[index], index, style })
        }
      />
    );
  }

  return (
    <div className={fallbackClassName}>
      {items.map((item, index) => renderItem({ item, index }))}
    </div>
  );
}

export default ResultsList;
