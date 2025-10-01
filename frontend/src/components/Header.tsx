import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import OfflineIndicator from "@/components/OfflineIndicator";
import { ShareSession } from "@/features/jam-session";

const Header = () => (
  <header className="sticky top-0 z-50 border-b bg-background/80 shadow-sm backdrop-blur-sm dark:bg-[--card]">
    <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center rounded-md transition-opacity hover:opacity-90"
        tabIndex={0}
        aria-label="Chordium home"
      >
        <img
          src="https://arthurboss.github.io/chordium-static/favicon-192.png"
          alt="Chordium logo"
          width={32}
          height={32}
          className="mr-2"
        />
        <h1 className="text-lg font-semibold">Chordium</h1>
      </Link>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <ShareSession />
        <OfflineIndicator />
        <ThemeToggle />
      </div>
    </div>
  </header>
);

export default Header;
