import GitHubIcon from "./icons/GitHubIcon";

const Footer = () => {
  return (
    <footer className="grid md:grid-cols-3 grid-cols-[1fr_auto] items-center mt-auto border-t py-3 px-6">
      <div className="hidden md:block" />
      
      <div className="text-sm text-muted-foreground text-left md:text-center">
        A minimal chord display web application
      </div>
      
      <div className="md:justify-self-end">
        <a 
          href="https://github.com/arthurboss/chordium" 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon size={24} />
          <span className="hidden sm:inline">Source</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
