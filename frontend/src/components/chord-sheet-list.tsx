import { useRef, useState } from "react";
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

  useRestoreScrollPosition(listRef, tabState?.scroll);
  usePersistScrollPosition(listRef, setTabState ? (scroll) => setTabState({ scroll }) : undefined);

  const sorted = sortChordSheets(chordSheets, sort);

  return (
    <div>
      {chordSheets.length > 0 ? (
        <>
          <div className="flex justify-end mb-3">
            <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
              <SelectTrigger className="w-40 [&>span]:text-left">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{t("sort.recent")}</SelectItem>
                <SelectItem value="most-played">{t("sort.mostPlayed")}</SelectItem>
                <SelectItem value="az">{t("sort.az")}</SelectItem>
                <SelectItem value="za">{t("sort.za")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {sorted.map((storedChordSheet, index) => (
                <ChordSheetCard
                  key={`${storedChordSheet.path}-${index}`}
                  chordSheet={storedChordSheet}
                  onView={onChordSheetSelect}
                  onDelete={() => onDeleteChordSheet(storedChordSheet.path)}
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
