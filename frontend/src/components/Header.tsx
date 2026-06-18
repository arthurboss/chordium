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

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 shadow-xs backdrop-blur-xs dark:bg-card">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="flex items-center rounded-md transition-opacity hover:opacity-90"
          tabIndex={0}
          aria-label={t("header.homeAriaLabel")}
        >
          <img
            src={isDark ? "logo-dark.png" : "logo-light.png"}
            alt="Chordium logo"
            width={40}
            height={40}
          />
          <h1 aria-label="Chordium" className="text-2xl font-semibold">hordium</h1>
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
