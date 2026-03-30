import * as React from "react";

import { cn } from "../../lib/utils";

type AccordionType = "single" | "multiple";

type AccordionContextValue = {
  type: AccordionType;
  collapsible: boolean;
  openValues: Set<string>;
  toggleValue: (value: string) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion components must be used within <Accordion />.");
  return ctx;
}

export function Accordion({
  type = "single",
  collapsible = true,
  defaultValue,
  value,
  onValueChange,
  className,
  children,
}: React.PropsWithChildren<{
  type?: AccordionType;
  collapsible?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (nextValue: string) => void;
  className?: string;
}>) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue ?? "");

  const currentValue = isControlled ? value! : internalValue;
  const openValues = React.useMemo(() => {
    // this playground only needs `type="single"`, but keep the structure for future use.
    return new Set([currentValue].filter(Boolean));
  }, [currentValue]);

  const toggleValue = React.useCallback(
    (next: string) => {
      if (!collapsible && openValues.has(next)) return;

      if (type === "single") {
        const nextValue = openValues.has(next) ? "" : next;
        if (!isControlled) setInternalValue(nextValue);
        onValueChange?.(nextValue);
        return;
      }

      // multiple mode is currently not used by this project.
      // Implementing it fully is left for later if needed.
      throw new Error("Accordion: type='multiple' is not implemented in this playground.");
    },
    [collapsible, isControlled, onValueChange, openValues, type],
  );

  const ctx: AccordionContextValue = React.useMemo(
    () => ({
      type,
      collapsible,
      openValues,
      toggleValue,
    }),
    [collapsible, openValues, toggleValue, type],
  );

  return (
    <AccordionContext.Provider value={ctx}>
      <div className={cn(className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <div data-accordion-item={value}>{children}</div>;
}

export function AccordionTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { openValues, toggleValue } = useAccordionContext();
  const isOpen = openValues.has(value);
  const controlsId = `accordion-content-${value}`;

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md px-4 py-3 text-left text-sm font-medium transition-colors",
        "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      onClick={() => toggleValue(value)}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="text-muted-foreground">
        {isOpen ? "−" : "+"}
      </span>
    </button>
  );
}

export function AccordionContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { openValues } = useAccordionContext();
  const isOpen = openValues.has(value);

  return (
    <div
      id={`accordion-content-${value}`}
      className={cn(
        "grid transition-all",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className={cn("overflow-hidden", className)}>{children}</div>
    </div>
  );
}

