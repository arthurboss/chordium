import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ErrorState from "@/components/ErrorState";
import PageHeader from "@/components/PageHeader";
import type { ChordViewerNavigationMethods } from "../chord-viewer.types";

interface ChordViewerErrorProps {
  readonly error: string;
  readonly navigation: ChordViewerNavigationMethods;
  readonly onBack: () => void;
}

const STATIC_ERROR_KEYS: Record<string, string> = {
  "Chord sheet not found": "errors:chordViewer.chordSheetNotFound",
  "Failed to load chord sheet": "errors:chordViewer.failedToLoad",
};

export function ChordViewerError({ error, navigation, onBack }: ChordViewerErrorProps) {
  const { t } = useTranslation();
  const translatedError = STATIC_ERROR_KEYS[error] ? t(STATIC_ERROR_KEYS[error]) : error;

  return (
    <main id="page-chord-viewer-error" className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
      <PageHeader
        onBack={onBack}
        title={t("errors:chordViewer.errorTitle")}
        titleClassName="text-destructive"
        rightContent={
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex-shrink-0 h-10 w-10 rounded-full"
            aria-label={t("errors:boundary.tryAgain")}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />
      <div className="mt-4">
        <ErrorState error={translatedError} />
      </div>
    </main>
  );
}
