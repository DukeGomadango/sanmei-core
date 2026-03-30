import type { InsenLayer2 } from "@sanmei/sanmei-core";
import { stemColorClasses, stemLabel, branchLabel } from "../lib/dictionaries";

export function InsenWidget({ insen }: { insen: InsenLayer2 | null }) {
  if (!insen) {
    return (
      <section className="min-h-56 rounded-lg bg-card p-5">
        <h3 className="mb-4 text-base font-semibold">陰占（命式）</h3>
        <div className="text-sm text-muted-foreground">実行すると陰占（命式）を表示します</div>
      </section>
    );
  }

  const pillars = [
    { label: "年", pillar: insen.year },
    { label: "月", pillar: insen.month },
    { label: "日", pillar: insen.day },
  ] as const;

  return (
    <section className="min-h-56 rounded-lg bg-card p-5">
      <h3 className="mb-4 text-base font-semibold">陰占（命式）</h3>
      <div className="grid grid-cols-3 gap-3">
        {pillars.map((p) => {
          const c = stemColorClasses(p.pillar.stem);
          return (
            <div key={p.label} className={`rounded-md border border-l-4 p-2.5 pl-3 ${c.border} ${c.bg}`}>
              <div className="text-xs font-medium text-muted-foreground">{p.label}柱</div>
              <div className={`mt-0.5 text-lg font-semibold ${c.text}`}>
                {stemLabel(p.pillar.stem)}{branchLabel(p.pillar.branch)}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                表示深度: {insen.displayDepth}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

