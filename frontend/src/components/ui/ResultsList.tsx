import { useLayoutEffect, useRef, useState } from 'react';
import VirtualizedList from '@/components/ui/VirtualizedList';
import { ResultsListProps } from './ResultsList.types';
import { CARD_HEIGHTS } from "@/constants/ui-constants";
import { cyAttr } from "@/utils/test-utils";

const VIRTUALIZE_THRESHOLD = 30;
const MIN_LIST_HEIGHT = 160;

/**
 * Generic results list wrapper.
 * Uses virtualization if there are more than 30 items.
 *
 * The scroll area is capped at 60vh and, when the surrounding chrome would
 * push the document past the viewport, shrunk to the space that is left so
 * the page itself never scrolls.
 */
export function ResultsList<T>({
  items,
  renderItem,
}: Readonly<ResultsListProps<T>>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState<number | null>(null);

  const itemCount = items?.length ?? 0;
  const isVirtualized = itemCount >= VIRTUALIZE_THRESHOLD;

  useLayoutEffect(() => {
    if (itemCount === 0) return;

    const measure = () => {
      const list = scrollRef.current;
      if (!list) return;

      const rect = list.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const below = document.documentElement.scrollHeight - (rect.bottom + window.scrollY);
      const available = window.innerHeight - top - below;
      const cap = window.innerHeight * 0.6;

      setListHeight(Math.max(MIN_LIST_HEIGHT, Math.floor(Math.min(cap, available))));
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [itemCount, isVirtualized]);

  if (itemCount === 0) return null;

  if (isVirtualized) {
    return (
      <VirtualizedList
        items={items}
        itemHeight={CARD_HEIGHTS.RESULT_CARD}
        height={listHeight ?? '60vh'}
        containerRef={scrollRef}
        renderItem={({ item, index, style }) =>
          renderItem({ item, index, style })
        }
      />
    );
  }

  return (
    <div
      ref={scrollRef}
      className="relative max-h-[60vh] w-full overflow-y-auto overscroll-contain"
      style={listHeight === null ? undefined : { maxHeight: listHeight }}
      {...cyAttr("results-scroll")}
    >
      <div className="grid grid-cols-1 gap-y-2">
        {items.map((item, index) => renderItem({ item, index }))}
      </div>
    </div>
  );
}

export default ResultsList;
