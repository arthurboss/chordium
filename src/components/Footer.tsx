
import { Link } from "react-router-dom";
import { Guitar, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-auto border-t py-6">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Guitar size={18} className="text-chord" />
          <span className="font-medium">ChordFlow</span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          A minimal chord display web application
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link 
            to="/upload" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Upload
          </Link>
          <a 
            href="#" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={14} />
            <span>Source</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
