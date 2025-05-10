import { Link } from "react-router-dom";
import { Guitar } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => (
    <header className="flex justify-between py-1.5 px-5 border-b shadow-sm bg-background/80 dark:bg-[--card] backdrop-blur-sm sticky top-0 z-50">
      <Link to="/" className="flex items-center ml-2 md:ml-3 gap-1.5 hover:opacity-90 transition-opacity">
        <Guitar size={24} className="text-chord"/>
        <h1 className="font-semibold text-lg m-0">Chordium</h1>
      </Link>
      <ThemeToggle />
    </header>
  );


export default Header;
