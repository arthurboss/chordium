import { forwardRef, ComponentRef, ComponentProps } from "react";
import { Item } from "@radix-ui/react-dropdown-menu";
import { cn, dropdownStyleClasses } from "./utils";

const DropdownMenuItem = forwardRef<
  ComponentRef<typeof Item>,
  ComponentProps<typeof Item> & {
    inset?: boolean;
    role?: string;
  }
>(({ className, inset, role = "menuitem", ...props }, ref) => (
  <Item
    ref={ref}
    className={cn(
      dropdownStyleClasses.item,
      inset && dropdownStyleClasses.insetItem,
      className
    )}
    role={role}
    {...props}
  />
));
DropdownMenuItem.displayName = Item.displayName;

export { DropdownMenuItem };
