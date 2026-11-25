import { useRef } from 'react';
import VirtualizedList from '@/components/ui/VirtualizedList';
import ScrollAffordance from '@/components/ui/ScrollAffordance';
import { ResultsListProps } from './ResultsList.types';
import { CARD_HEIGHTS } from "@/constants/ui-constants";
import { cyAttr } from "@/utils/test-utils";
import { useFitListHeight } from "@/hooks/useFitListHeight";

const VIRTUALIZE_THRESHOLD = 30;

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

  const itemCount = items?.length ?? 0;
  const isVirtualized = itemCount >= VIRTUALIZE_THRESHOLD;
  const listHeight = useFitListHeight(scrollRef, itemCount);

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
    <>
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
      <ScrollAffordance
        parentRef={scrollRef}
        getTotalSize={() => scrollRef.current?.scrollHeight ?? 0}
      />
    </>
  );
}

export default ResultsList;
