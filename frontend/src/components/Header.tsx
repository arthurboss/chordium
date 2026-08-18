import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShareSession } from "@/features/jam-session";
import ThemeToggle from "@/components/ThemeToggle";
import OfflineIndicator from "@/components/OfflineIndicator";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTheme } from "@/utils/theme-utils";

const Header = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const logoSrc = isDark ? "logo-dark.png" : "logo-light.png";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 shadow-xs backdrop-blur-xs dark:bg-card">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="flex items-center rounded-md transition-opacity hover:opacity-90"
          tabIndex={0}
          aria-label={t("header.homeAriaLabel")}
        >
          {failedSrc === logoSrc ? (
            <h1 className="text-2xl font-semibold">Chordium</h1>
          ) : (
            <img
              src={logoSrc}
              alt="Chordium"
              width={382}
              height={100}
              className="h-8 w-auto"
              onError={() => setFailedSrc(logoSrc)}
            />
          )}
        </Link>

        <div className="flex items-center gap-2">
          <ShareSession />
          <OfflineIndicator />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
