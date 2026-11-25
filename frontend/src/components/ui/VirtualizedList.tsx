import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import ScrollAffordance from '@/components/ui/ScrollAffordance';
import { cyAttr } from '@/utils/test-utils';

interface VirtualizedListProps<T> {
  readonly items: T[];
  readonly itemHeight: number;
  readonly renderItem: (props: { item: T; index: number; style: React.CSSProperties }) => React.ReactNode;
  readonly className?: string;
  readonly height?: number | string;
  readonly containerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * VirtualizedList
 *
 * A generic, virtualized scrollable list component using @tanstack/react-virtual.
 * Renders only visible items for performance, supports custom item rendering, and shows a scroll arrow for navigation.
 *
 * @template T - The type of items in the list
 * @param items - Array of items to render
 * @param itemHeight - Height of each item (in px)
 * @param renderItem - Function to render each item ({ item, index, style })
 * @param className - Additional CSS classes for the container
 * @param height - Height of the scrollable area (default: '60vh')
 *
 * The component automatically shows a scroll arrow at the bottom or top for quick navigation.
 */
function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  className = '',
  height = '60vh',
  containerRef,
}: VirtualizedListProps<T>) {
  const internalRef = useRef<HTMLDivElement>(null);
  const parentRef = containerRef ?? internalRef;

  const gap = 8; // px, matches gap-y-2
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan: 5,
  });

  const getTotalSize = React.useCallback(() => rowVirtualizer.getTotalSize(), [rowVirtualizer]);

  return (
    <>
      <div
        ref={parentRef}
        className={`relative w-full overscroll-contain ${className}`}
        {...cyAttr('results-scroll')}
        style={{ height, overflow: 'auto', scrollbarWidth: 'none' }}
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const index = virtualRow.index;
            return (
              <div
                key={virtualRow.key}
                data-index={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: virtualRow.size - gap,
                  transform: `translateY(${virtualRow.start}px)`,
                  boxSizing: 'border-box',
                }}
              >
                {renderItem({ item: items[index], index, style: { height: virtualRow.size - gap } })}
              </div>
            );
          })}
        </div>

      </div>

      <ScrollAffordance parentRef={parentRef} getTotalSize={getTotalSize} />
    </>
  );
}

export default VirtualizedList;
