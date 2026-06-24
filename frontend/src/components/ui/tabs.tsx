import "./tabs.css";
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

interface TabsContextType {
  activeValue: string;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ value, onValueChange, ...props }, ref) => {
  const [activeValue, setActiveValue] = React.useState(value || "");

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      setActiveValue(newValue);
      onValueChange?.(newValue);
    },
    [onValueChange]
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveValue(value);
    }
  }, [value]);

  return (
    <TabsContext.Provider value={{ activeValue }}>
      <TabsPrimitive.Root
        ref={ref}
        value={activeValue}
        onValueChange={handleValueChange}
        {...props}
      />
    </TabsContext.Provider>
  );
});
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const updateIndicator = React.useCallback(() => {
    const listElement = listRef.current;
    if (!listElement) return;

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
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, []);

  React.useLayoutEffect(() => {
    updateIndicator();
  }, [context?.activeValue, updateIndicator]);

  React.useLayoutEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(listElement);

    return () => resizeObserver.disconnect();
  }, [updateIndicator]);

  return (
    <TabsPrimitive.List
      ref={(node) => {
        listRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={cn(
        "relative inline-flex h-12 items-center justify-center content-center rounded-lg p-1.5 text-muted-foreground border bg-card",
        className
      )}
      data-tabs-list=""
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute top-[0.375rem] bottom-[0.375rem] rounded-sm bg-background transition-all duration-200 ease-in-out"
        style={indicatorStyle}
      />
      {children}
    </TabsPrimitive.List>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, onKeyDown, ...props }, ref) => {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-xs px-3 py-1.5 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=inactive]:hover:text-white",
        className
      )}
      onKeyDown={onKeyDown}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-2", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
