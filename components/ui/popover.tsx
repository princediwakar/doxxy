"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const StableIdContext = React.createContext<string>("");

function useStableId() {
  return React.useContext(StableIdContext);
}

function Popover({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) {
  const stableId = React.useId();
  return (
    <StableIdContext.Provider value={stableId}>
      <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>
    </StableIdContext.Provider>
  );
}

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>((props, ref) => {
  const stableId = useStableId();
  return (
    <PopoverPrimitive.Trigger
      ref={ref}
      {...props}
      aria-controls={stableId || undefined}
    />
  );
});
PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  const stableId = useStableId();
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        {...props}
        align={align}
        sideOffset={sideOffset}
        id={stableId || undefined}
        className={cn(
          "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
