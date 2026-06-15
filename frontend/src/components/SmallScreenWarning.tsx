import { memo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const mediaQuery = typeof window !== "undefined"
  ? window.matchMedia("(max-width: 359px)")
  : null;

export function useIsTooSmall() {
  const [tooSmall, setTooSmall] = useState(() => mediaQuery?.matches ?? false);

  useEffect(() => {
    if (!mediaQuery) return;
    const handler = (e: MediaQueryListEvent) => setTooSmall(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return tooSmall;
}

const SmallScreenWarning = memo(() => {
  const { t } = useTranslation();

  return (
    <div className="flex fixed inset-0 items-center justify-center p-4 bg-background">
      <div className="text-center text-foreground max-w-sm">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold mb-2">{t("smallScreenWarning.title")}</h1>
        <p className="text-lg">{t("smallScreenWarning.message")}</p>
      </div>
    </div>
  );
});

SmallScreenWarning.displayName = "SmallScreenWarning";

export default SmallScreenWarning;
