import React, { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FormContainerProps {
  children: ReactNode;
  className?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <Card className="mb-2">
        <CardContent className="p-4 sm:p-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormContainer;
