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
  /** Rendered as a full-height segment attached to the field's right edge, e.g. a submit button. */
  trailingButton?: ReactNode;
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
  trailingButton,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const showClear = !!value && !disabled;

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
      <div className="form-field-shell flex items-stretch overflow-hidden rounded-md border bg-background">
        <div className="relative flex-1">
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
            className={`w-full rounded-none border-0 bg-transparent focus-visible:ring-0 ${leftIcon ? 'pl-9' : ''} ${showClear ? 'pr-9' : ''}`}
            required={required}
          />
          {showClear && (
            <ClearInputButton
              onClick={() => {
                onChange("");
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
            />
          )}
        </div>
        {trailingButton}
      </div>
    </div>
  );
};

export default FormField;
