import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ScrollArrow } from '@/components/ui/ScrollArrow';
import { useAtBottom } from '@/hooks/useAtBottom';

interface VirtualizedListProps<T> {
  readonly items: T[];
  readonly itemHeight: number;
  readonly renderItem: (props: { item: T; index: number; style: React.CSSProperties }) => React.ReactNode;
  readonly className?: string;
  readonly height?: number | string;
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
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const gap = 8; // px, matches gap-y-2
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan: 5,
  });

  const getTotalSize = React.useCallback(() => rowVirtualizer.getTotalSize(), [rowVirtualizer]);
  const isAtBottom = useAtBottom({ ref: parentRef, getTotalSize });

  return (
    <>
      <div
        ref={parentRef}
        className={`relative w-full ${className}`}
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

      <div className='relative w-full z-10'>
        {/* Fades straight into the container's own background color rather than
            masking a blurred view of the cards behind it - that blur had no
            fixed color of its own, so the fade never quite matched the
            container in either theme. This list only ever sits inside the
            results card, so it reads --card, the same token that card is
            painted with, rather than the page's own --background. */}
        {!isAtBottom && (<div className="pointer-events-none absolute h-8 w-full translate-y-[-2rem]" style={{
          background:
            'linear-gradient(to bottom, hsl(var(--card) / 0) 0%, hsl(var(--card) / 0.1) 20%, hsl(var(--card) / 0.6) 50%, hsl(var(--card) / 0.9) 80%, hsl(var(--card)) 100%)',
        }}
        />)}

        <div className="flex justify-center w-fit mx-auto translate-y-[-1rem]">
          <ScrollArrow
            parentRef={parentRef}
            getTotalSize={getTotalSize}
          />
        </div>
      </div>
    </>
  );
}

export default VirtualizedList;
