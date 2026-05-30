import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

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
  defaultNS: "common",
  ns: ["common", "notifications", "errors"],
  interpolation: { escapeValue: false },
  detection: {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
  },
});

export default i18n;
