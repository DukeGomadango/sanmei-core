import type { DynamicTimeline } from "@sanmei/sanmei-core";

type DaiunTimeline = DynamicTimeline["daiun"];

export function TimelineWidget({ daiun }: { daiun: DaiunTimeline | null }) {
  if (!daiun) {
    return (
      <section className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 text-base font-semibold">大運</h3>
        <div className="text-sm text-muted-foreground">応答を待っています</div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-base font-semibold">大運</h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {daiun.phases.map((p) => {
          const isCurrent = p.phaseIndex === daiun.currentPhase.phaseIndex;
          return (
            <div
              key={p.phaseIndex}
              className={`min-w-[7.5rem] rounded-md border p-2 ${isCurrent ? "bg-blue-50 border-blue-200" : "bg-white/10"}`}
            >
              <div className="text-xs text-muted-foreground">phase</div>
              <div className="text-sm font-semibold">{p.phaseIndex}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                startAge: {daiun.startAge + p.phaseIndex * p.spanYears}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

