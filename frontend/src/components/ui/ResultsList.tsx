import VirtualizedList from '@/components/ui/VirtualizedList';
import { ResultsListProps } from './ResultsList.types';
import { CARD_HEIGHTS } from "@/constants/ui-constants";
import { cyAttr } from "@/utils/test-utils";

const VIRTUALIZE_THRESHOLD = 30;

/**
 * Generic results list wrapper.
 * Uses virtualization if there are more than 30 items.
 */
export function ResultsList<T>({
  items,
  renderItem,
}: Readonly<ResultsListProps<T>>) {
  if (!items || items.length === 0) return null;

  const isVirtualized = items.length >= VIRTUALIZE_THRESHOLD;
  if (isVirtualized) {
    return (
      <VirtualizedList
        items={items}
        itemHeight={CARD_HEIGHTS.RESULT_CARD}
        renderItem={({ item, index, style }) =>
          renderItem({ item, index, style })
        }
      />
    );
  }

  return (
    <div className="relative max-h-[60vh] w-full overflow-y-auto overscroll-contain" {...cyAttr("results-scroll")}>
      <div className="grid grid-cols-1 gap-y-2">
        {items.map((item, index) => renderItem({ item, index }))}
      </div>
    </div>
  );
}

export default ResultsList;
