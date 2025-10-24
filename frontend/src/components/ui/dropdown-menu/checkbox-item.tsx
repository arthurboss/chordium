import { forwardRef, ComponentRef, ComponentProps } from "react";
import { CheckboxItem, ItemIndicator } from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { cn, dropdownStyleClasses } from "./utils";

const DropdownMenuCheckboxItem = forwardRef<
  ComponentRef<typeof CheckboxItem>,
  ComponentProps<typeof CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className={dropdownStyleClasses.indicator}>
      <ItemIndicator>
        <Check className="h-4 w-4" />
      </ItemIndicator>
    </span>
    {children}
  </CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = CheckboxItem.displayName;

export { DropdownMenuCheckboxItem };
