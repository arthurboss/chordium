import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import type { ChordSheetListProps, SortOption } from "./chord-sheet-list.types";
import ChordSheetCard from "@/chord-sheet/components/ChordSheetCard";
import FormContainer from "@/components/ui/FormContainer";
import ScrollAffordance from "@/components/ui/ScrollAffordance";
import { Checkbox } from "@/components/ui/checkbox";
import { cyAttr } from "@/utils/test-utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SortSelect from "@/components/ui/SortSelect";
import { useRestoreScrollPosition, usePersistScrollPosition } from "@/hooks/useScrollPosition";
import { useFitListHeight } from "@/hooks/useFitListHeight";
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
  onDeleteChordSheets,
  onUploadClick,
  tabState,
  setTabState,
}: ChordSheetListProps) => {
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<SortOption>("recent");
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    lastPath: string;
    active: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  useRestoreScrollPosition(listRef, tabState?.scroll);
  usePersistScrollPosition(listRef, setTabState ? (scroll) => setTabState({ scroll }) : undefined);

  const listHeight = useFitListHeight(listRef, chordSheets.length, true, 1);

  const sorted = sortChordSheets(chordSheets, sort);

  useEffect(() => {
    setSelectedPaths((prev) => {
      if (prev.size === 0) return prev;
      const available = new Set(chordSheets.map((sheet) => sheet.path));
      const next = new Set([...prev].filter((path) => available.has(path)));
      return next.size === prev.size ? prev : next;
    });
  }, [chordSheets]);

  const selectedCount = selectedPaths.size;
  const allSelected = sorted.length > 0 && sorted.every((sheet) => selectedPaths.has(sheet.path));
  const selectAllState = allSelected ? true : selectedCount > 0 ? "indeterminate" : false;

  const toggleSelection = (path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedPaths(new Set(sorted.map((sheet) => sheet.path)));
    } else {
      setSelectedPaths(new Set());
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (selectedCount === 0 || event.button !== 0) return;
    const card = (event.target as HTMLElement).closest("[data-chord-sheet-path]") as HTMLElement | null;
    const path = card?.getAttribute("data-chord-sheet-path");
    if (!path || !selectedPaths.has(path)) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastPath: path,
      active: false,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers (tests) are not capturable.
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;

    if (!drag.active) {
      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
      if (distance < 6) return;
      drag.active = true;
      setIsDragSelecting(true);
    }

    const dx = event.clientX - drag.lastX;
    const dy = event.clientY - drag.lastY;
    const distance = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.min(40, Math.ceil(distance / 16)));
    const toToggle = new Set<string>();
    let lastPath = drag.lastPath;

    for (let step = 1; step <= steps; step += 1) {
      const x = drag.lastX + (dx * step) / steps;
      const y = drag.lastY + (dy * step) / steps;
      const card = document
        .elementFromPoint(x, y)
        ?.closest("[data-chord-sheet-path]") as HTMLElement | null;
      const path = card?.getAttribute("data-chord-sheet-path");
      if (!path || path === lastPath) continue;

      lastPath = path;
      if (toToggle.has(path)) {
        toToggle.delete(path);
      } else {
        toToggle.add(path);
      }
    }

    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastPath = lastPath;

    if (toToggle.size === 0) return;

    setSelectedPaths((prev) => {
      const next = new Set(prev);
      toToggle.forEach((path) => {
        if (next.has(path)) {
          next.delete(path);
        } else {
          next.add(path);
        }
      });
      return next;
    });
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (drag.active) {
      suppressClickRef.current = true;
      setIsDragSelecting(false);
    }
    dragRef.current = null;
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Nothing to release when the pointer was never captured.
    }
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleBulkDelete = async () => {
    const paths = [...selectedPaths];
    if (paths.length === 0) return;
    setSelectedPaths(new Set());
    await onDeleteChordSheets(paths);
  };

  return (
    <FormContainer contentClassName="pb-2">
      {chordSheets.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <SortSelect
            value={sort}
            onValueChange={setSort}
            options={[
              { value: "recent", label: t("sort.recent") },
              { value: "most-played", label: t("sort.mostPlayed") },
              { value: "az", label: t("sort.az") },
              { value: "za", label: t("sort.za") },
            ]}
          />
          <div className="flex items-center gap-2 pr-6">
            <label
              htmlFor="select-all-chord-sheets"
              className="cursor-pointer text-xs text-foreground sm:text-sm"
            >
              {t("chordSheetList.selectAll")}
            </label>
            <Checkbox
              id="select-all-chord-sheets"
              checked={selectAllState}
              onCheckedChange={toggleSelectAll}
              className="bg-card"
              {...cyAttr("select-all-chord-sheets")}
            />
          </div>
        </div>
      )}

      {selectedCount > 0 && (
        <div
          className="mb-2 flex items-center justify-between gap-2 rounded-md border bg-background px-2 py-2"
          {...cyAttr("bulk-actions")}
        >
          <span className="text-sm font-medium text-foreground">
            {t("chordSheetList.selected", { count: selectedCount })}
          </span>
          <Button
            onClick={() => setConfirmOpen(true)}
            variant="destructive"
            size="sm"
            {...cyAttr("bulk-delete")}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t("chordSheetList.deleteSelected")}
          </Button>
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("chordSheetList.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("chordSheetList.deleteConfirmDesc", { count: selectedCount })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel {...cyAttr("cancel-bulk-delete")}>{t("chordSheetList.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => { void handleBulkDelete(); }}
              {...cyAttr("confirm-bulk-delete")}
            >
              {t("chordSheetList.deleteSelected")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {chordSheets.length > 0 ? (
        <>
          <div
            ref={listRef}
            className={`relative max-h-[60vh] overflow-y-auto overscroll-contain${
              isDragSelecting ? " select-none" : ""
            }`}
            style={{
              maxHeight: listHeight ?? undefined,
              scrollbarWidth: "none",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onClickCapture={handleClickCapture}
            {...cyAttr("chord-sheet-scroll")}
          >
            <div className="flex flex-col gap-2">
              {sorted.map((storedChordSheet) => (
                <ChordSheetCard
                  key={storedChordSheet.path}
                  chordSheet={storedChordSheet}
                  onView={selectedCount > 0 ? (sheet) => toggleSelection(sheet.path) : onChordSheetSelect}
                  isSelected={selectedPaths.has(storedChordSheet.path)}
                  onToggleSelect={() => toggleSelection(storedChordSheet.path)}
                />
              ))}
            </div>
          </div>
          <ScrollAffordance
            parentRef={listRef}
            getTotalSize={() => listRef.current?.scrollHeight ?? 0}
          />
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
    </FormContainer>
  );
};

export default ChordSheetList;
