import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
import { TRANSLATABLE_LANGUAGES } from "@/services/translation/types";

const i18n = i18next
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (lang: string, ns: string) => import(`../locales/${lang}/${ns}.json`)
    )
  )
  .use(initReactI18next);

i18n.init({
  fallbackLng: "en",
  // Only the languages the app is actually translated into; anything else the
  // browser reports falls back rather than asking for a locale file that does
  // not exist.
  supportedLngs: [...TRANSLATABLE_LANGUAGES],
  // A regional browser language falls back through its base language, so
  // "de-AT" reads as German and "es-MX" as Spanish, while "pt-BR" is kept whole
  // because that is the form the app ships.
  load: "all",
  defaultNS: "common",
  ns: ["common", "notifications", "errors"],
  interpolation: { escapeValue: false },
  detection: {
    // The reader's own choice wins; otherwise follow the browser, which already
    // reflects the system language, so no location lookup is needed.
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
  },
});

export default i18n;
