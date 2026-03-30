import type { PropsWithChildren } from "react";

import { cn } from "../lib/utils";

type TileTone = "default" | "primary" | "secondary" | "accent";

const toneClassByTone: Record<TileTone, string> = {
  default: "bg-card",
  primary: "bg-slate-50/70",
  secondary: "bg-sky-50/65",
  accent: "bg-amber-50/65",
};

export function BentoTileWrapper({
  children,
  className,
  tone = "default",
}: PropsWithChildren<{ className?: string; tone?: TileTone }>) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/90 shadow-sm transition-shadow",
        "hover:shadow",
        className,
      )}
    >
      <div className={cn("rounded-[11px]", toneClassByTone[tone])}>{children}</div>
    </div>
  );
}

