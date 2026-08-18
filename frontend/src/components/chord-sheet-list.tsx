import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ChordSheetListProps, SortOption } from "./chord-sheet-list.types";
import ChordSheetCard from "@/chord-sheet/components/ChordSheetCard";
import VirtualizedList from "@/components/ui/VirtualizedList";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CARD_HEIGHTS } from "@/constants/ui-constants";
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
}: ChordSheetListProps) => {
  const { t } = useTranslation();
  const [sort, setSort] = useState<SortOption>("recent");

  const sorted = sortChordSheets(chordSheets, sort);
  const shouldVirtualize = sorted.length >= 15;

  return (
    <div>
      {chordSheets.length > 0 ? (
        <>
          <div className="flex justify-end mb-4 sm:mb-6">
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
          </div>

          {shouldVirtualize ? (
            <VirtualizedList
              items={sorted}
              itemHeight={CARD_HEIGHTS.RESULT_CARD}
              renderItem={({ item, style }) => (
                <div style={style}>
                  <ChordSheetCard
                    chordSheet={item}
                    onView={onChordSheetSelect}
                    onDelete={() => onDeleteChordSheet(item.path)}
                  />
                </div>
              )}
            />
          ) : (
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
