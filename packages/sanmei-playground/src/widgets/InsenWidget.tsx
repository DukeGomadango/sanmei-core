import type { InsenLayer2 } from "@sanmei/sanmei-core";
import { stemColorClasses, stemLabel, branchLabel } from "../lib/dictionaries";

export function InsenWidget({ insen }: { insen: InsenLayer2 | null }) {
  if (!insen) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="text-sm text-muted-foreground">Insen（陰占）を表示します</div>
      </div>
    );
  }

  const pillars = [
    { label: "年", pillar: insen.year },
    { label: "月", pillar: insen.month },
    { label: "日", pillar: insen.day },
  ] as const;

  return (
    <section className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-base font-semibold">陰占（命式）</h3>
      <div className="grid grid-cols-3 gap-2">
        {pillars.map((p) => {
          const c = stemColorClasses(p.pillar.stem);
          return (
            <div key={p.label} className={`rounded-md border p-2 ${c.border} ${c.bg}`}>
              <div className="text-xs text-muted-foreground">{p.label}</div>
              <div className={`text-lg font-semibold ${c.text}`}>
                {stemLabel(p.pillar.stem)}{branchLabel(p.pillar.branch)}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                depth: {insen.displayDepth}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

