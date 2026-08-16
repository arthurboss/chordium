import React, { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FormContainerProps {
  children: ReactNode;
  className?: string;
  /** Appended after the content area's own p-4, so a caller can override e.g. its bottom padding. */
  contentClassName?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({
  children,
  className = "",
  contentClassName = "",
}) => {
  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <Card className="mb-2">
        <CardContent className={`p-4 ${contentClassName}`}>
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormContainer;
