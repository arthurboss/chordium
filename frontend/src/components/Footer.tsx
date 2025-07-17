import GitHubIcon from "./icons/GitHubIcon";

const Footer = () => {
  return (
    <footer className="flex justify-end py-1 px-3 sm:px-4 dark:bg-[--card] items-center mt-auto border-t">  
        <a 
          href="https://github.com/arthurboss/chordium" 
          className="p-[4px] text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon size={24} />
          <span className="hidden sm:inline">Source</span>
        </a>
    </footer>
  );
};

export default Footer;
