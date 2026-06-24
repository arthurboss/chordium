import React, { ReactNode, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { handleInputFocus } from "@/utils/handleInputFocus";
import { X } from "lucide-react";
import "./form-field.css";

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
  value = "",
  onChange,
  placeholder,
  required = false,
  leftIcon,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    handleInputFocus(e, value, inputRef);
  };

  const showClearButton = value && !disabled;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}{required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          ref={inputRef}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full ${leftIcon ? 'pl-10' : ''} ${showClearButton ? 'pr-9' : ''}`}
          required={required}
        />
        {leftIcon && (
          <div
            className={`icon-gradient-border absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full shrink-0 ${value ? 'icon-filled' : 'icon-empty'}`}
          >
            {leftIcon}
          </div>
        )}
        <div className={`clear-input-button-container absolute right-2.5 top-1/2 -translate-y-1/2 ${showClearButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full p-0 text-destructive"
            onClick={() => {
              onChange("");
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            aria-label="Clear input"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormField;
