import { forwardRef, ComponentRef, ComponentProps } from "react";
import { SubTrigger } from "@radix-ui/react-dropdown-menu";
import { ChevronRight } from "lucide-react";
import { cn, dropdownStyleClasses, dropdownAnimationClasses } from "./utils";

const DropdownMenuSubTrigger = forwardRef<
  ComponentRef<typeof SubTrigger>,
  ComponentProps<typeof SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && dropdownStyleClasses.insetItem,
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </SubTrigger>
));
DropdownMenuSubTrigger.displayName = SubTrigger.displayName;

export { DropdownMenuSubTrigger };
