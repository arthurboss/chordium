import { forwardRef, ComponentRef, ComponentProps } from "react";
import { Content, Portal } from "@radix-ui/react-dropdown-menu";
import { cn, dropdownStyleClasses, dropdownAnimationClasses } from "./utils";

const DropdownMenuContent = forwardRef<
  ComponentRef<typeof Content>,
  ComponentProps<typeof Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
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
      {...props}
    />
  </Portal>
));
DropdownMenuContent.displayName = Content.displayName;

export { DropdownMenuContent };
