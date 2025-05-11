import { forwardRef, ComponentRef, ComponentProps } from "react";
import { SubContent } from "@radix-ui/react-dropdown-menu";
import { cn, dropdownStyleClasses, dropdownAnimationClasses } from "./utils";

const DropdownMenuSubContent = forwardRef<
  ComponentRef<typeof SubContent>,
  ComponentProps<typeof SubContent>
>(({ className, ...props }, ref) => (
  <SubContent
    ref={ref}
    className={cn(
      dropdownStyleClasses.content,
      "shadow-lg",
      dropdownAnimationClasses.base,
      dropdownAnimationClasses.sides,
      className
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = SubContent.displayName;

export { DropdownMenuSubContent };
