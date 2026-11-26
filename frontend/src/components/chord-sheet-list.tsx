import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Trash2, Upload } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRestoreScrollPosition, usePersistScrollPosition } from "@/hooks/useScrollPosition";
import { useFitListHeight } from "@/hooks/useFitListHeight";
import type { ChordSheetListItem } from "@/storage/stores/chord-sheets/operations/get-all-saved";
import {
  createBackup,
  createBackupDownload,
  importBackup,
  readBackupFile,
} from "@/storage/services/backup";
import i18n from "@/i18n/config";

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

function downloadBackup(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const ChordSheetList = ({
  chordSheets,
  onChordSheetSelect,
  onDeleteChordSheet,
  onDeleteChordSheets,
  onUploadClick,
  onImportComplete,
  tabState,
  setTabState,
}: ChordSheetListProps) => {
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sort, setSort] = useState<SortOption>("recent");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  useRestoreScrollPosition(listRef, tabState?.scroll);
  usePersistScrollPosition(listRef, setTabState ? (scroll) => setTabState({ scroll }) : undefined);

  const listHeight = useFitListHeight(listRef, chordSheets.length, true, 1);

  const sorted = sortChordSheets(chordSheets, sort);
  const canExport = !Capacitor.isNativePlatform();

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

  const handleBulkDelete = async () => {
    const paths = [...selectedPaths];
    if (paths.length === 0) return;
    setSelectedPaths(new Set());
    await onDeleteChordSheets(paths);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const backup = await createBackup();
      const download = await createBackupDownload(backup);
      downloadBackup(download.blob, download.fileName);
      toast.success(i18n.t("notifications:backup.exported"), {
        description: i18n.t("notifications:backup.exportedDesc", {
          count: backup.songs.length,
        }),
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to export chord sheets:", error);
      }
      toast.error(i18n.t("notifications:backup.exportFailed"), {
        description: i18n.t("notifications:backup.exportFailedDesc"),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsImporting(true);
    try {
      const parsed = await readBackupFile(file);
      const result = await importBackup(parsed);
      toast.success(i18n.t("notifications:backup.imported"), {
        description: i18n.t("notifications:backup.importedDesc", {
          count: result.songsImported,
        }),
      });
      await onImportComplete?.();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to import chord sheets:", error);
      }
      toast.error(i18n.t("notifications:backup.importFailed"), {
        description: i18n.t("notifications:backup.importFailedDesc"),
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {canExport && (
            <Button
              onClick={handleExport}
              disabled={chordSheets.length === 0 || isExporting}
              variant="outline"
              size="sm"
              className="h-10 bg-card"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {t("backup.exportButton")}
            </Button>
          )}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            variant="outline"
            size="sm"
            className="h-10 bg-card"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {t("backup.importButton")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,application/gzip,.json,.json.gz,.gz"
            className="hidden"
            onChange={handleImportFile}
            aria-label={t("backup.importAriaLabel")}
          />
        </div>
        {chordSheets.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-chord-sheets"
                checked={selectAllState}
                onCheckedChange={toggleSelectAll}
                className="bg-card"
                {...cyAttr("select-all-chord-sheets")}
              />
              <label
                htmlFor="select-all-chord-sheets"
                className="cursor-pointer text-xs text-foreground sm:text-sm"
              >
                {t("chordSheetList.selectAll")}
              </label>
            </div>
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
        )}
      </div>

      {chordSheets.length > 0 ? (
        <FormContainer contentClassName="pb-2">
          {selectedCount > 0 && (
            <div
              className="mb-2 flex items-center justify-between gap-2 rounded-md border bg-background px-2 py-1.5"
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
          <div
            ref={listRef}
            className="relative max-h-[60vh] overflow-y-auto overscroll-contain"
            style={listHeight === null ? undefined : { maxHeight: listHeight }}
            {...cyAttr("chord-sheet-scroll")}
          >
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
          <ScrollAffordance
            parentRef={listRef}
            getTotalSize={() => listRef.current?.scrollHeight ?? 0}
          />
        </FormContainer>
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
