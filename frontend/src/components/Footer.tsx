import { useTranslation } from "react-i18next";
import GitHubIcon from "./icons/GitHubIcon";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t dark:bg-card">
      <div className="flex justify-between items-center py-1 px-4 max-w-3xl mx-auto">
        <a
          href="https://github.com/arthurboss/chordium"
          className="p-[4px] text-sm text-muted-foreground hover:text-foreground transition-colors flex flex-row-reverse sm:flex-row items-center gap-1.5"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon size={24} />
          <span>{t("footer.source")}</span>
        </a>
        <span
          className="p-[4px] text-sm text-muted-foreground"
          aria-label={t("footer.version", { version: __APP_VERSION__ })}
        >
          v{__APP_VERSION__}
        </span>
      </div>
    </footer>
  );
};

export default Footer;
