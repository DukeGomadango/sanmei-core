import type { DynamicTimeline } from "@sanmei/sanmei-core";

type DaiunTimeline = DynamicTimeline["daiun"];

export function TimelineWidget({ daiun }: { daiun: DaiunTimeline | null }) {
  if (!daiun) {
    return (
      <section className="min-h-56 rounded-lg bg-card p-5">
        <h3 className="mb-4 text-base font-semibold">大運</h3>
        <div className="text-sm text-muted-foreground">実行すると大運タイムラインを表示します</div>
      </section>
    );
  }

  const lastIdx = daiun.phases.length - 1;

  return (
    <section className="min-h-56 rounded-lg bg-card p-5">
      <h3 className="mb-4 text-base font-semibold">大運</h3>
      <div className="flex items-center overflow-x-auto pb-2">
        <div className="flex items-center gap-4 px-1">
        {daiun.phases.map((p, idx) => {
          const isCurrent = p.phaseIndex === daiun.currentPhase.phaseIndex;
          const startAge = daiun.startAge + p.phaseIndex * p.spanYears;
          return (
            <div key={p.phaseIndex} className="flex shrink-0 items-center gap-3">
              {/* dot */}
              <div className="relative flex flex-col items-center">
                <div
                  className={[
                    "rounded-full border",
                    isCurrent ? "h-4 w-4 border-sky-400 bg-sky-100 shadow-sm" : "h-3 w-3 border-slate-300 bg-white/20",
                  ].join(" ")}
                />
                <div className={`mt-2 whitespace-nowrap text-[11px] ${isCurrent ? "text-sky-900 font-semibold" : "text-muted-foreground"}`}>
                  フェーズ {p.phaseIndex}
                </div>
                <div className={`whitespace-nowrap text-[11px] ${isCurrent ? "text-sky-900/80" : "text-muted-foreground/80"}`}>
                  {startAge}歳〜
                </div>
              </div>

              {/* connector */}
              {idx !== lastIdx && <div className={`h-px w-6 ${isCurrent ? "bg-sky-300/80" : "bg-slate-200/70"}`} />}
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}

