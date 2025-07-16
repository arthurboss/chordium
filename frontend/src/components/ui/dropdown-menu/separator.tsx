import { forwardRef, ComponentRef, ComponentProps } from "react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { cn, dropdownStyleClasses } from "./utils";

const DropdownMenuSeparator = forwardRef<
  ComponentRef<typeof Separator>,
  ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator
    ref={ref}
    className={cn(dropdownStyleClasses.separator, className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = Separator.displayName;

export { DropdownMenuSeparator };
