import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ChordSheetListProps, SortOption } from "./chord-sheet-list.types";
import ChordSheetCard from "@/chord-sheet/components/ChordSheetCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ListFilterRow from "@/components/lists/ListFilterRow";
import { useLists } from "@/storage/hooks/use-lists";
import { useRestoreScrollPosition, usePersistScrollPosition } from "@/hooks/useScrollPosition";
import type { ChordSheetListItem } from "@/storage/stores/chord-sheets/operations/get-all-saved";

function sortChordSheets(items: ChordSheetListItem[], sort: SortOption): ChordSheetListItem[] {
  const arr = [...items];
  switch (sort) {
    case "recent":
      return arr.sort((a, b) => (b.storage.lastAccessed ?? 0) - (a.storage.lastAccessed ?? 0));
    case "az":
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    case "za":
      return arr.sort((a, b) => b.title.localeCompare(a.title));
    case "most-played":
      return arr.sort((a, b) => (b.storage.accessCount ?? 0) - (a.storage.accessCount ?? 0));
  }
}

const ChordSheetList = ({
  chordSheets,
  onChordSheetSelect,
  onDeleteChordSheet,
  onUploadClick,
  tabState,
  setTabState,
}: ChordSheetListProps) => {
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<SortOption>("recent");
  const [activeListId, setActiveListId] = useState<string | null>(null);

  const {
    lists,
    getPathsForList,
    getListIdsForPath,
    createList,
    renameList,
    deleteList,
    toggleListItem,
  } = useLists();

  useRestoreScrollPosition(listRef, tabState?.scroll);
  usePersistScrollPosition(listRef, setTabState ? (scroll) => setTabState({ scroll }) : undefined);

  const sorted = sortChordSheets(chordSheets, sort);

  const filtered = useMemo(() => {
    if (!activeListId) return sorted;
    const paths = getPathsForList(activeListId);
    return sorted.filter((item) => paths.has(item.path));
    // sorted is derived fresh every render from chordSheets/sort, so it is
    // intentionally left out: including it would re-run this on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeListId, getPathsForList, chordSheets, sort]);

  return (
    <div>
      {chordSheets.length > 0 ? (
        <>
          <ListFilterRow
            lists={lists}
            activeListId={activeListId}
            onSelectList={setActiveListId}
            onCreateList={createList}
            onRenameList={renameList}
            onDeleteList={deleteList}
          />
          <div className="flex justify-end mb-4 sm:mb-6">
            <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
              <SelectTrigger className="h-7 w-26 md:w-30 gap-1 bg-background px-2 text-xs focus:ring-1 focus:ring-offset-0 [&>span]:text-left [&>span]:line-clamp-none [&>span]:truncate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] [&_svg]:hidden [&_[role=option]]:pl-2">
                <SelectItem value="recent">{t("sort.recent")}</SelectItem>
                <SelectItem value="most-played">{t("sort.mostPlayed")}</SelectItem>
                <SelectItem value="az">{t("sort.az")}</SelectItem>
                <SelectItem value="za">{t("sort.za")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
            <div className="flex flex-col gap-2">
              {filtered.map((storedChordSheet) => (
                <ChordSheetCard
                  key={storedChordSheet.path}
                  chordSheet={storedChordSheet}
                  onView={onChordSheetSelect}
                  onDelete={() => onDeleteChordSheet(storedChordSheet.path)}
                  lists={lists}
                  listIdsForPath={getListIdsForPath(storedChordSheet.path)}
                  onToggleList={(listId) => toggleListItem(listId, storedChordSheet.path)}
                  onCreateList={createList}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-3">{t("chordSheetList.empty")}</p>
          <Button
            onClick={onUploadClick}
            variant="outline"
            tabIndex={0}
            aria-label={t("chordSheetList.uploadAriaLabel")}
          >
            {t("chordSheetList.uploadButton")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChordSheetList;
