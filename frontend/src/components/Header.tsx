import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const Header = () => (
    <header className="flex justify-between py-1.5 px-3 sm:px-4 border-b shadow-sm bg-background/80 dark:bg-[--card] backdrop-blur-sm sticky top-0 z-50">
      <Link 
        to="/" 
        className="flex items-center p-[4px] hover:opacity-90 transition-opacity rounded-md"
        tabIndex={0}
        aria-label="Chordium home"
      >
        <img
          src="/favicon-192.png"
          alt="Chordium logo"
          width={32}
          height={32}
          className="mr-1"
        />
        <h1 className="font-semibold text-lg m-0">Chordium</h1>
      </Link>
      
      <div className="flex items-center gap-2">
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
    </header>
  );


export default Header;
