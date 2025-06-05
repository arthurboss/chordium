import React, { ReactNode, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { handleInputFocus } from "@/utils/handleInputFocus";
import ClearInputButton from "@/components/ui/ClearInputButton";

interface FormFieldProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  leftIcon?: ReactNode;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  leftIcon,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Move cursor to end on focus if value exists
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    handleInputFocus(e, value, inputRef);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}{required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          ref={inputRef}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full ${leftIcon ? 'pl-9' : ''} ${value ? 'pr-9' : ''}`}
          required={required}
        />
        {value && !disabled && (
          <ClearInputButton
            onClick={() => {
              onChange("");
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FormField;
