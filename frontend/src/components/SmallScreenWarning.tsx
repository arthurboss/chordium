import { memo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Uses max-[319px]:flex to show only on screens smaller than 320px
 */
const SmallScreenWarning = memo(() => {
  const { t } = useTranslation();

  return (
    <div className="hidden max-[319px]:flex fixed inset-0 z-50 flex items-center justify-center p-4 bg-white">
      <div className="text-center text-gray-800 max-w-sm">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold mb-2">{t("smallScreenWarning.title")}</h1>
        <p className="text-lg">{t("smallScreenWarning.message")}</p>
      </div>
    </div>
  );
});

SmallScreenWarning.displayName = "SmallScreenWarning";

export default SmallScreenWarning;
