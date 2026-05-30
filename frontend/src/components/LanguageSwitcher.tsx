import React, { useState, useRef } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { USFlag, BRFlag, ESFlag } from "@/components/icons/flags";

const LOCALES = [
  { code: "en", flag: <USFlag className="!h-6 !w-6" /> },
  { code: "pt-BR", flag: <BRFlag className="!h-6 !w-6" /> },
  { code: "es", flag: <ESFlag className="!h-6 !w-6" /> },
] as const;

const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [showFlag, setShowFlag] = useState(false);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentIndex = LOCALES.findIndex((l) => l.code === i18n.resolvedLanguage);
  const nextLocale = LOCALES[(currentIndex + 1) % LOCALES.length];

  const handleClick = () => {
    setVisible(false);

    setTimeout(() => {
      i18n.changeLanguage(nextLocale.code);
      setShowFlag(true);
      setVisible(true);
    }, 200);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setShowFlag(false);
        setVisible(true);
      }, 200);
    }, 2200);
  };

  const selectedFlag = LOCALES.find((l) => l.code === i18n.resolvedLanguage)?.flag;

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={t("language.switcher")}
      className="h-10 w-10 rounded-full p-0"
      onClick={handleClick}
    >
      <span
        className={`inline-flex items-center justify-center transition-all duration-200 ${
          visible ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        {showFlag ? selectedFlag : <Globe className="h-4 w-4" />}
      </span>
    </Button>
  );
};

export default LanguageSwitcher;
