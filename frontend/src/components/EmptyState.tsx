import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  message: string;
  dataTestId?: string;
}

const EmptyState = ({ message, dataTestId = "empty-state" }: EmptyStateProps) => (
  <Card data-testid={dataTestId} className="p-6 text-center text-muted-foreground">{message}</Card>
);

export default EmptyState;


