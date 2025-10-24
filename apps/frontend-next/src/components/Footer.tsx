import GitHubIcon from '@/assets/icons/github-logo.svg';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="flex justify-end sm:justify-center py-1 px-4 max-w-3xl mx-auto">
        <Link
          href="https://github.com/arthurboss/chordium"
          className="flex flex-row-reverse sm:flex-row items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon />
          <span>Source</span>
        </Link>
      </div>
    </footer>
  );
};