import { Link } from "react-router-dom";
import { Guitar, Search, MusicIcon } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => (
    <header className="flex justify-between py-1.5 px-5 border-b shadow-sm bg-background/80 dark:bg-[--card] backdrop-blur-sm sticky top-0 z-50">
      <Link 
        to="/" 
        className="flex items-center ml-2 md:ml-3 p-[4px] gap-1.5 hover:opacity-90 transition-opacity rounded-md"
        tabIndex={0}
        aria-label="Chordium home"
      >
        <Guitar size={24} className="text-chord"/>
        <h1 className="font-semibold text-lg m-0">Chordium</h1>
      </Link>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <MusicIcon className="h-4 w-4 mr-2" />
              Tools
            </Button>
          </DropdownMenuTrigger>
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
