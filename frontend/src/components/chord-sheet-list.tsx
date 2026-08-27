import { useRef, useState, useCallback } from "react";
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
import { useRestoreScrollPosition, usePersistScrollPosition } from "@/hooks/useScrollPosition";
import type { ChordSheetListItem } from "@/storage/stores/chord-sheets/operations/get-all-saved";
import { Checkbox } from "@/components/ui/checkbox";
import VirtualizedList from "@/components/ui/VirtualizedList";
import { CARD_HEIGHTS } from "@/constants/ui-constants";
import { Trash2 } from "lucide-react";

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
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  useRestoreScrollPosition(listRef, tabState?.scroll);
  usePersistScrollPosition(listRef, setTabState ? (scroll) => setTabState({ scroll }) : undefined);

  const sorted = sortChordSheets(chordSheets, sort);

  const toggleSelection = useCallback((path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedPaths(new Set(sorted.map((sheet) => sheet.path)));
    } else {
      setSelectedPaths(new Set());
    }
  }, [sorted]);

  const bulkDelete = useCallback(() => {
    selectedPaths.forEach((path) => onDeleteChordSheet(path));
    setSelectedPaths(new Set());
  }, [selectedPaths, onDeleteChordSheet]);

  const isVirtualized = chordSheets.length >= 15;

  return (
    <div className="flex flex-col h-full">
      {chordSheets.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6 pr-[13px]">
            <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
              <SelectTrigger className="w-40 bg-card [&>span]:text-left">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{t("sort.recent")}</SelectItem>
                <SelectItem value="most-played">{t("sort.mostPlayed")}</SelectItem>
                <SelectItem value="az">{t("sort.az")}</SelectItem>
                <SelectItem value="za">{t("sort.za")}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex shrink-0 items-center gap-2">
              <label
                htmlFor="select-all-chord-sheets"
                className="cursor-pointer text-sm text-foreground"
              >
                {t("chordSheetList.selectAll")}
              </label>
              <Checkbox
                id="select-all-chord-sheets"
                checked={
                  selectedPaths.size === sorted.length && sorted.length > 0
                    ? true
                    : selectedPaths.size > 0
                    ? "indeterminate"
                    : false
                }
                onCheckedChange={selectAll}
                className="h-4 w-4 shrink-0 bg-card data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 relative">

            {isVirtualized ? (
              <VirtualizedList
                items={sorted}
                itemHeight={72}
                renderItem={({ item, style }) => (
                  <div style={style} className="flex items-center py-1">
                    <ChordSheetCard
                      chordSheet={item}
                      onView={onChordSheetSelect}
                      onDelete={() => onDeleteChordSheet(item.path)}
                      isSelected={selectedPaths.has(item.path)}
                      onToggleSelect={() => toggleSelection(item.path)}
                    />
                  </div>
                )}
              />
            ) : (
              <div ref={listRef} className="overflow-y-auto max-h-[60vh]">
                <div className="flex flex-col gap-2">
                  {sorted.map((storedChordSheet) => (
                    <ChordSheetCard
                      key={storedChordSheet.path}
                      chordSheet={storedChordSheet}
                      onView={onChordSheetSelect}
                      onDelete={() => onDeleteChordSheet(storedChordSheet.path)}
                      isSelected={selectedPaths.has(storedChordSheet.path)}
                      onToggleSelect={() => toggleSelection(storedChordSheet.path)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedPaths.size > 0 && (
            <div className="sticky bottom-0 left-0 right-0 bg-card border-t border-border p-3 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">
                {selectedPaths.size} {selectedPaths.size === 1 ? t("chordSheetList.itemSelected") || "item selected" : t("chordSheetList.itemsSelected") || "items selected"}
              </span>
              <Button
                onClick={bulkDelete}
                variant="destructive"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                {t("chordSheetList.delete") || "Delete"}
              </Button>
            </div>
          )}
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
