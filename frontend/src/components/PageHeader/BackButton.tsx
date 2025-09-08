import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onBack: () => void;
}

/**
 * Reusable back button component for navigation
 */
const BackButton = ({ onBack }: BackButtonProps) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onBack}
    className="flex-shrink-0"
    tabIndex={0}
    aria-label="back-button"
  >
    <ArrowLeft className="h-4 w-4 text-primary" />
    <span className="hidden sm:inline">Back</span>
  </Button>
);

export default BackButton;
