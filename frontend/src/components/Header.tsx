import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import OfflineIndicator from "@/components/OfflineIndicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const Header = () => (
  <header className="py-1.5 border-b shadow-xs bg-background/80 dark:bg-(--card) backdrop-blur-xs sticky">
    <div className="flex justify-between px-4 max-w-3xl mx-auto">
      <Link
        to="/"
        className="flex items-center hover:opacity-90 transition-opacity rounded-md"
        tabIndex={0}
        aria-label="Chordium home"
      >
        <img
          src="https://arthurboss.github.io/chordium-static/favicon-192.png"
          alt="Chordium logo"
          width={32}
          height={32}
          className="mr-1"
        />
        <h1 className="font-semibold text-lg m-0">Chordium</h1>
      </Link>

      <div className="flex items-center gap-2">
        <OfflineIndicator />
        <DropdownMenu>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/search" className="w-full cursor-pointer">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Link>
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </div>
  </header>
);


export default Header;
