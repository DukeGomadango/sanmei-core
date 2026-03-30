import type { PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs", className)}>{children}</span>;
}

