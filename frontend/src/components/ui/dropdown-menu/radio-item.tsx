import { forwardRef, ComponentRef, ComponentProps } from "react";
import { RadioItem, ItemIndicator } from "@radix-ui/react-dropdown-menu";
import { Circle } from "lucide-react";
import { cn, dropdownStyleClasses } from "./utils";

const DropdownMenuRadioItem = forwardRef<
  ComponentRef<typeof RadioItem>,
  ComponentProps<typeof RadioItem>
>(({ className, children, ...props }, ref) => (
  <RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className={dropdownStyleClasses.indicator}>
      <ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </ItemIndicator>
    </span>
    {children}
  </RadioItem>
));
DropdownMenuRadioItem.displayName = RadioItem.displayName;

export { DropdownMenuRadioItem };
