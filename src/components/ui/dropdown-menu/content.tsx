import { forwardRef, ComponentRef, ComponentProps } from "react";
import { Content, Portal } from "@radix-ui/react-dropdown-menu";
import { cn, dropdownStyleClasses, dropdownAnimationClasses } from "./utils";

const DropdownMenuContent = forwardRef<
  ComponentRef<typeof Content>,
  ComponentProps<typeof Content> & {
    role?: string; 
  }
>(({ className, sideOffset = 4, role = "menu", ...props }, ref) => (
  <Portal>
    <Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        dropdownStyleClasses.content,
        "shadow-md",
        dropdownAnimationClasses.base,
        dropdownAnimationClasses.sides,
        className
      )}
      role={role}
      {...props}
    />
  </Portal>
));
DropdownMenuContent.displayName = Content.displayName;

export { DropdownMenuContent };
