import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Download, Guitar, Menu, Shield, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/utils/theme-utils";
import { getIconByTheme } from "@/utils/theme-icons";
import { ShareSession } from "@/features/jam-session";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import GuitarTuner from "@/features/tuner/GuitarTuner";
import { cyAttr } from "@/utils/test-utils";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";
import {
  createBackup,
  createBackupDownload,
  importBackup,
  readBackupFile,
} from "@/storage/services/backup";
import { CHORD_SHEETS_CHANGED_EVENT } from "@/storage/events";
import i18n from "@/i18n/config";

const ROW_CLASS = "flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-accent";

const THEMES = ["light", "dark", "system"] as const;

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

/**
 * Everything the header used to spread across separate icon buttons, now
 * behind one entry point. Follows LanguageSwitcher's responsive shell so the
 * two feel like the same menu system: a bottom sheet on phones, a popover on
 * bigger screens. Every row is itself the clickable target, icon on the
 * left, so the list reads the same whether it opens a sub-panel or acts
 * directly.
 *
 * The tuner is opened in controlled mode and rendered as a sibling, outside
 * this menu's own sheet/popover: that container unmounts its children when
 * it closes, which would tear the tuner down together with whatever it had
 * just opened if it lived inside `rows` like the other entries.
 */
const HeaderMenu = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { activeTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [tunerOpen, setTunerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const canExport = !Capacitor.isNativePlatform();

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
      window.dispatchEvent(new Event(CHORD_SHEETS_CHANGED_EVENT));
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

  const cycleTheme = () => {
    const nextTheme = THEMES[(THEMES.indexOf(activeTheme) + 1) % THEMES.length];
    setTheme(nextTheme);
  };

  const openTuner = () => {
    setOpen(false);
    setTunerOpen(true);
  };

  const rows = (
    <div className="flex flex-col divide-y">
      <button type="button" onClick={openTuner} className={ROW_CLASS}>
        <Guitar className="h-4 w-4" />
        {t("header.tunerAriaLabel")}
      </button>

      <ShareSession
        trigger={(icon) => (
          <button type="button" className={ROW_CLASS}>
            {icon}
            {t("jamSession.jamSession")}
          </button>
        )}
      />

      <button
        type="button"
        onClick={() => {
          setOpen(false);
          fileInputRef.current?.click();
        }}
        disabled={isImporting}
        className={`${ROW_CLASS} disabled:opacity-50`}
      >
        <Download className="h-4 w-4" />
        {t("backup.importButton")}
      </button>

      {canExport && (
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            void handleExport();
          }}
          disabled={isExporting}
          className={`${ROW_CLASS} disabled:opacity-50`}
        >
          <Upload className="h-4 w-4" />
          {t("backup.exportButton")}
        </button>
      )}

      <button type="button" onClick={cycleTheme} className={ROW_CLASS}>
        {getIconByTheme(activeTheme, 16)}
        {t("header.menu.theme")}
      </button>

      <Link to="/privacy" className={ROW_CLASS} onClick={() => setOpen(false)}>
        <Shield className="h-4 w-4" />
        {t("header.menu.privacy")}
      </Link>

      <LanguageSwitcher
        trigger={(icon) => (
          <button type="button" className={ROW_CLASS}>
            {icon}
            {t("language.switcher")}
          </button>
        )}
      />
    </div>
  );

  const trigger = (
    <Button
      variant="outline"
      size="icon"
      aria-label={t("header.menuAriaLabel")}
      title={t("header.menuAriaLabel")}
      // card and background swap places between the themes: card is the lighter
      // of the two in light mode and the darker in dark mode. The header takes
      // whichever one this does not, so the button sits above it either way -
      // sharing a token with the header would leave it a border and nothing else.
      className="h-10 w-10 rounded-full bg-card dark:bg-background"
      {...cyAttr("header-menu-button")}
    >
      <Menu className="h-4 w-4" />
    </Button>
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,application/gzip,.json,.json.gz,.gz"
        className="hidden"
        onChange={handleImportFile}
        aria-label={t("backup.importAriaLabel")}
      />
      <GuitarTuner open={tunerOpen} onOpenChange={setTunerOpen} />
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent
            side="bottom"
            className="flex max-h-[92dvh] flex-col gap-0 rounded-t-xl px-0 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
          >
            <SheetHeader className="shrink-0 px-4 text-left">
              <SheetTitle>{t("header.menuAriaLabel")}</SheetTitle>
              <SheetDescription className="sr-only">{t("header.menuAriaLabel")}</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 overflow-y-auto overscroll-contain">{rows}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent align="end" className="w-max overflow-hidden p-0">
            {rows}
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

export default HeaderMenu;
