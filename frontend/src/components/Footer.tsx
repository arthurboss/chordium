import { useTranslation } from "react-i18next";
import GitHubIcon from "./icons/GitHubIcon";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t dark:bg-card">
      <div className="flex justify-end sm:justify-center py-2 px-4 max-w-3xl mx-auto">
        <a
          href="https://github.com/arthurboss/chordium"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex flex-row-reverse sm:flex-row items-center gap-1.5 rounded-md"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon size={24} />
          <span>{t("footer.source")}</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
