import { Card } from "@/components/ui/card";

const ErrorState = ({ error }: { error: string }) => (
  <Card className="p-6 text-center text-foreground">{error}</Card>
);

export default ErrorState;
