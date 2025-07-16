import { forwardRef, ComponentRef, ComponentProps } from "react";
import { Label } from "@radix-ui/react-dropdown-menu";
import { cn, dropdownStyleClasses } from "./utils";

const DropdownMenuLabel = forwardRef<
  ComponentRef<typeof Label>,
  ComponentProps<typeof Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn(
      dropdownStyleClasses.label,
      inset && dropdownStyleClasses.insetItem,
      className
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = Label.displayName;

export { DropdownMenuLabel };
