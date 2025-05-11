import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    left: 0,
    width: 0,
    opacity: 0, // Start hidden
  });

  const combinedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      (listRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref]
  );

  React.useLayoutEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    const updateIndicator = () => {
      const activeTrigger = listElement.querySelector<HTMLElement>(
        '[data-state="active"]'
      );
      if (activeTrigger) {
        setIndicatorStyle({
          left: activeTrigger.offsetLeft,
          width: activeTrigger.offsetWidth,
          opacity: 1,
        });
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();

    const mutationObserver = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-state'
        ) {
          updateIndicator();
          return;
        }
      }
    });

    mutationObserver.observe(listElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-state'],
    });

    const resizeObserver = new ResizeObserver(() => {
      updateIndicator();
    });
    resizeObserver.observe(listElement);
    Array.from(listElement.querySelectorAll<HTMLElement>('[role="tab"]')).forEach(trigger => {
        resizeObserver.observe(trigger);
    });

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <TabsPrimitive.List
      ref={combinedRef}
      className={cn(
        "relative inline-flex h-12 items-center justify-center content-center rounded-md p-1.5 text-muted-foreground border bg-card dark:bg-[var(--card)]",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute top-[0.375rem] bottom-[0.375rem] rounded-sm bg-background border transition-all duration-200 ease-in-out"
        style={indicatorStyle}
      />
      {children}
    </TabsPrimitive.List>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
      className
    )}
    tabIndex={0}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ",
      className
    )}
    tabIndex={0}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
