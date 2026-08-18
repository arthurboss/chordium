import React, { useState } from "react";
import { Clock, User, Search, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { searchCacheService } from "@/storage/services/search-cache/search-cache-service";
import type { SearchHistoryEntry } from "@/search/hooks/useSearchHistory";

interface SearchHistoryProps {
  history: SearchHistoryEntry[];
  onSelect: (entry: SearchHistoryEntry) => void;
  onClear: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onSelect, onClear }) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [confirming, setConfirming] = useState(false);

  if (history.length === 0) return null;

  async function handleConfirmClear() {
    await searchCacheService.clear();
    setConfirming(false);
    onClear();
  }

  const title = t("searchHistory.clearTitle");
  // Says what actually goes. The list is drawn from the cached searches themselves,
  // so clearing it takes their saved results with it: the next search of something
  // searched before has to be fetched again, and cannot be had offline at all.
  const body = t("searchHistory.clearBody");

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between px-1 mb-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1 leading-7">
          <Clock className="h-3 w-3" />
          {t("searchHistory.heading")}
        </p>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="group text-xs text-muted-foreground flex items-center gap-1 transition-colors hover:bg-transparent focus:outline-none"
        >
          <Trash2 className="h-3 w-3 text-destructive/50 group-hover:text-destructive transition-colors" />
          {t("searchHistory.clear")}
        </button>
      </div>

      {/* A sheet on phones, where it rises next to the thumb and can use the full
          width, as the language panel does. On larger screens a dialog instead: this
          is a decision that cannot be undone, so it wants the focus trap and the
          dimmed page behind it that a dialog brings and a sheet does not. */}
      {isMobile ? (
        <Sheet open={confirming} onOpenChange={setConfirming}>
          <SheetContent
            side="bottom"
            className="gap-0 rounded-t-xl pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <SheetHeader className="text-left">
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{body}</SheetDescription>
            </SheetHeader>
            {/* Stacked, with the destructive one first: it is what the reader came
                for, and on a phone the lowest button is the easiest to hit. */}
            <SheetFooter className="mt-4 flex-col gap-2 sm:flex-col sm:space-x-0">
              <Button variant="outline" onClick={() => setConfirming(false)}>
                {t("searchHistory.cancel")}
              </Button>
              <Button variant="destructive" onClick={handleConfirmClear}>
                {t("searchHistory.clearConfirm")}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        <AlertDialog open={confirming} onOpenChange={setConfirming}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>{body}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("searchHistory.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmClear}
                className={cn(buttonVariants({ variant: "destructive" }))}
              >
                {t("searchHistory.clearConfirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div className="grid grid-cols-1 gap-y-2">
        {history.map((entry) => {
          // An artist opened from results is shown under their real name; a search
          // is shown as it was typed.
          const isArtist = entry.kind === "artist-songs";
          const label = isArtist ? entry.displayName || entry.query : entry.query;
          const Icon = isArtist ? User : Search;

          return (
            <Card
              key={entry.timestamp}
              className="overflow-hidden cursor-pointer w-full h-12 min-h-0 opacity-80 hover:bg-primary/5 dark:hover:bg-primary/5 hover:border-primary transition-colors"
              onClick={() => onSelect(entry)}
            >
              <CardContent
                className="p-4 flex-1 flex flex-row items-center gap-2 min-h-0"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary shrink-0"><Icon className="h-4 w-4 text-white" /></div>
                <div className="min-w-0 flex-1">
                  <h3 className="w-full block font-semibold truncate text-sm" title={label}>
                    {label}
                  </h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SearchHistory;
