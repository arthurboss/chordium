
import { Link } from "react-router-dom";
import { FileMusic, Guitar, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b shadow-sm bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex justify-between items-center py-3 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 text-chord hover:opacity-90 transition-opacity">
          <Guitar size={24} />
          <span className="font-semibold text-xl hidden sm:inline">ChordFlow</span>
        </Link>

        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          className="md:hidden" 
          size="icon"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={20} />
        </Button>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-4">
          <Link 
            to="/upload" 
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileMusic size={18} />
            <span>Upload</span>
          </Link>
          <Button size="sm" asChild>
            <Link to="/">Search Chords</Link>
          </Button>
        </nav>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b shadow-md py-4 px-6 flex flex-col gap-4 md:hidden animate-fade-in">
            <Link 
              to="/upload" 
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMenuOpen(false)}
            >
              <FileMusic size={18} />
              <span>Upload Chord Sheet</span>
            </Link>
            <Button size="sm" asChild onClick={() => setMenuOpen(false)}>
              <Link to="/">Search Chords</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
