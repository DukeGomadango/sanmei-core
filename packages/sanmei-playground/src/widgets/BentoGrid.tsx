import type { PropsWithChildren } from "react";

export function BentoGrid({ children }: PropsWithChildren) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {children}
    </div>
  );
}

