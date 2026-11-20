import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
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

  useRestoreScrollPosition(listRef, tabState?.scroll);
  usePersistScrollPosition(listRef, setTabState ? (scroll) => setTabState({ scroll }) : undefined);

  const sorted = sortChordSheets(chordSheets, sort);

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
          <Button
            onClick={handleExport}
            disabled={chordSheets.length === 0 || isExporting}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {t("backup.exportButton")}
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            variant="outline"
            size="sm"
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
        )}
      </div>

      {chordSheets.length > 0 ? (
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            {sorted.map((storedChordSheet) => (
              <ChordSheetCard
                key={storedChordSheet.path}
                chordSheet={storedChordSheet}
                onView={onChordSheetSelect}
                onDelete={() => onDeleteChordSheet(storedChordSheet.path)}
              />
            ))}
          </div>
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
