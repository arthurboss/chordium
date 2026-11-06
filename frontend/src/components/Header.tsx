import "./Header.css";
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
    <header className="sticky top-0 z-50 border-b bg-card backdrop-blur-xs">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="flex items-center rounded-md px-2 py-1 transition-all duration-200"
          tabIndex={0}
          aria-label={t("header.homeAriaLabel")}
        >
          <img
            src={isDark ? "logo-dark.png" : "logo-light.png"}
            alt="C"
            aria-hidden="true"
            width={32}
            height={32}
            className="logo-icon transition-all duration-200"
          />
          <h1 className="text-2xl font-semibold logo-text" aria-hidden="true">hordium</h1>
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
