import { useState, useEffect } from "react";
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
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(false);
    img.src = isDark ? "logo-dark.png" : "logo-light.png";
  }, [isDark]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 shadow-xs backdrop-blur-xs dark:bg-card">
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-3 py-2 sm:px-4 sm:py-3">
        <Link
          to="/"
          className="flex-shrink-0 rounded-md transition-opacity hover:opacity-90"
          tabIndex={0}
          aria-label={t("header.homeAriaLabel")}
        >
          {imageLoaded && (
            <img
              src={isDark ? "logo-dark.png" : "logo-light.png"}
              alt="Chordium"
              width={800}
              height={120}
              className="h-auto w-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg opacity-0 transition-opacity duration-300"
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          )}
          {!imageLoaded && (
            <h1 className="text-2xl font-semibold sm:text-3xl">Chordium</h1>
          )}
        </Link>

        <div className="flex items-center gap-2 flex-shrink-0">
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
