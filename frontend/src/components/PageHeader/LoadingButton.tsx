import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * Loading button component for pre-rendering states
 */
export const LoadingButton = () => (
  <Button
    variant="loading"
    size="sm"
    disabled
    className="flex-shrink-0"
    aria-label="loading"
  >
    <Loader2 className="h-4 w-4 animate-spin" />
    <span className="hidden sm:inline">Loading</span>
  </Button>
);
