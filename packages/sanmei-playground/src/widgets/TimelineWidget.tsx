import type { DynamicTimeline } from "@sanmei/sanmei-core";
import { indexToStemBranch } from "@sanmei/sanmei-core/sexagenary";
import { stemLabel, branchLabel } from "../lib/dictionaries";

type DaiunTimeline = DynamicTimeline["daiun"];

function phaseGanzhi(index: number): string {
  const { stem, branch } = indexToStemBranch(index);
  return `${stemLabel(stem)}${branchLabel(branch)}`;
}

export function TimelineWidget({ daiun }: { daiun: DaiunTimeline | null }) {
  if (!daiun) {
    return (
      <section className="min-h-56 rounded-lg bg-card p-5" id="section-daiun">
        <h3 className="mb-4 text-base font-semibold">大運（daiun）</h3>
        <div className="text-sm text-muted-foreground">実行すると大運タイムラインを表示します</div>
      </section>
    );
  }

  const lastIdx = daiun.phases.length - 1;

  return (
    <section className="min-h-56 rounded-lg bg-card p-5" id="section-daiun">
      <h3 className="mb-4 text-base font-semibold">大運（daiun）</h3>

      <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>
          起算満年齢: <strong className="text-foreground">{daiun.startAge}</strong>
        </span>
        {daiun.direction !== undefined && (
          <span>
            順逆行:{" "}
            <strong className="text-foreground">{daiun.direction === "forward" ? "順行" : "逆行"}</strong>
          </span>
        )}
        {daiun.startDayDiff !== undefined && (
          <span>
            startDayDiff: <strong className="font-mono text-foreground">{daiun.startDayDiff}</strong>
          </span>
        )}
        <span>
          現在フェーズ:{" "}
          <strong className="text-foreground whitespace-nowrap">
            #{daiun.currentPhase.phaseIndex} {phaseGanzhi(daiun.currentPhase.sexagenaryIndex)}
          </strong>
        </span>
      </div>

      <div className="flex items-center overflow-x-auto pb-2">
        <div className="flex items-center gap-4 px-1">
          {daiun.phases.map((p, idx) => {
            const isCurrent = p.phaseIndex === daiun.currentPhase.phaseIndex;
            const startAge = daiun.startAge + p.phaseIndex * p.spanYears;
            const interactions = p.interactions ?? [];
            return (
              <div key={p.phaseIndex} className="flex shrink-0 items-center gap-3">
                <div className="relative flex flex-col items-center">
                  <div
                    className={[
                      "rounded-full border",
                      isCurrent ? "h-4 w-4 border-sky-400 bg-sky-100 shadow-sm" : "h-3 w-3 border-slate-300 bg-white/20",
                    ].join(" ")}
                  />
                  <div
                    className={`mt-2 whitespace-nowrap text-[11px] ${isCurrent ? "text-sky-900 font-semibold" : "text-muted-foreground"}`}
                  >
                    フェーズ {p.phaseIndex}
                  </div>
                  <div
                    className={`whitespace-nowrap text-[11px] ${isCurrent ? "text-sky-900/80" : "text-muted-foreground/80"}`}
                  >
                    {startAge}歳〜
                  </div>
                  <div className={`mt-0.5 max-w-[10rem] whitespace-nowrap text-[10px] ${isCurrent ? "text-sky-800" : "text-muted-foreground"}`}>
                    {phaseGanzhi(p.sexagenaryIndex)}
                  </div>
                  {interactions.length > 0 && (
                    <details className="mt-1 max-w-[14rem]">
                      <summary className="cursor-pointer text-[10px] text-sky-700 underline">位相 {interactions.length}件</summary>
                      <ul className="mt-1 max-h-32 overflow-y-auto space-y-1 border border-border/60 bg-muted/30 p-1 text-[10px]">
                        {interactions.map((it, j) => (
                          <li key={j} className="whitespace-nowrap">
                            <span className="font-medium">{it.kind}</span> {it.targetPillar} phase={it.phaseIndex}
                            {it.involved && it.involved.length > 0 ? ` · ${it.involved.join(",")}` : ""}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
                {idx !== lastIdx ? <div className={`h-px w-6 shrink-0 ${isCurrent ? "bg-sky-300/80" : "bg-slate-200/70"}`} /> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
