import React, { useCallback, useState } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import BlinkingArrow from "@/components/ui/BlinkingArrow";

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (props: ListChildComponentProps & { item: T }) => React.ReactNode;
  className?: string;
  height?: number | string;
  showArrow?: boolean;
}

function VirtualizedListWithArrow<T>({
  items,
  itemHeight,
  renderItem,
  className = "custom-scrollbar scrollbar-always",
  height = '70vh',
  showArrow = true
}: VirtualizedListProps<T>) {
  const [isAtBottom, setIsAtBottom] = useState(false);

  const handleScroll = useCallback(({ 
    scrollOffset, 
    scrollHeight, 
    clientHeight 
  }: { 
    scrollOffset: number; 
    scrollHeight: number; 
    clientHeight: number; 
  }) => {
    const maxScroll = scrollHeight - clientHeight;
    setIsAtBottom(scrollOffset >= maxScroll - 30);
  }, []);

  return (
    <div className="relative w-full" style={{ height, overflow: 'hidden' }}>
      <AutoSizer>
        {({ height: autoHeight, width }) => (
          <List
            height={autoHeight}
            itemCount={items.length}
            itemSize={itemHeight}
            width={width}
            onScroll={({ scrollOffset }) => {
              const scrollHeight = itemHeight * items.length;
              const clientHeight = autoHeight;
              handleScroll({
                scrollOffset,
                scrollHeight,
                clientHeight
              });
            }}
            style={{ overflowY: 'scroll', overflowX: 'hidden' }}
            className={className}
          >
            {(props: ListChildComponentProps) => renderItem({ ...props, item: items[props.index] })}
          </List>
        )}
      </AutoSizer>
      {showArrow && !isAtBottom && (
        <div className="absolute left-0 bottom-5 w-full flex justify-center pointer-events-none z-10">
          <BlinkingArrow direction="down" />
        </div>
      )}
    </div>
  );
}

export default VirtualizedListWithArrow;
