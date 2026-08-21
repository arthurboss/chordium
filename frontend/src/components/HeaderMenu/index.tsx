import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Guitar, Menu } from "lucide-react";
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

const ROW_CLASS = "flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-accent";

const THEMES = ["light", "dark", "system"] as const;

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

      <button type="button" onClick={cycleTheme} className={ROW_CLASS}>
        {getIconByTheme(activeTheme, 16)}
        {t("header.menu.theme")}
      </button>

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
