import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { validateRoute } from "@/utils/route-validation";
import RedirectToHome from "@/components/RedirectToHome";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const validation = validateRoute(location.pathname);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "Validation result:",
      validation
    );
  }, [location.pathname, validation]);

  if (validation.shouldRedirectHome) {
    return <RedirectToHome reason={`Invalid URL pattern: ${location.pathname}`} />;
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center max-w-md w-full gap-6">
        <AlertTriangle className="mx-auto h-16 w-16 text-orange-400" />
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("notFound.title")}</h1>
          <p className="text-lg text-muted-foreground mb-4">{t("notFound.message")}</p>
          <p className="text-muted-foreground mb-6">{t("notFound.hint")}</p>
        </div>

        <Button asChild className="flex items-center gap-2">
          <a href="/">
            <Home className="h-4 w-4" />
            {t("notFound.returnHome")}
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
