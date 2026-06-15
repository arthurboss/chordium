import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { ChordSheetListProps } from "./chord-sheet-list.types";
import ChordSheetCard from "@/chord-sheet/components/ChordSheetCard";
import { Button } from "@/components/ui/button";
import { useRestoreScrollPosition, usePersistScrollPosition } from "@/hooks/useScrollPosition";

const ChordSheetList = ({
  chordSheets,
  onChordSheetSelect,
  onDeleteChordSheet,
  onUploadClick,
  tabState,
  setTabState
}: ChordSheetListProps) => {
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);

  useRestoreScrollPosition(listRef, tabState?.scroll);
  usePersistScrollPosition(listRef, setTabState ? (scroll) => setTabState({ scroll }) : undefined);

  return (
    <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
      {chordSheets.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {[...chordSheets].reverse().map((storedChordSheet, index) => (
            <ChordSheetCard
              key={`${storedChordSheet.path}-${index}`}
              chordSheet={storedChordSheet}
              onView={onChordSheetSelect}
              onDelete={() => onDeleteChordSheet(storedChordSheet.path)}
            />
          ))}
        </div>
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
