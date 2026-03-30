import type { InteractionRulesLayer2 } from "@sanmei/sanmei-core";
import { elementLabel } from "../lib/dictionaries";

type IsouhouEntry = InteractionRulesLayer2["isouhou"][number];
type ResolutionMeta = NonNullable<InteractionRulesLayer2["resolutionMeta"]>;

export function IsouhouWidget({
  isouhou,
  guardianDeities,
  kishin,
  resolutionMeta,
}: {
  isouhou: IsouhouEntry[] | null;
  guardianDeities: number[] | null;
  kishin: number[] | null;
  resolutionMeta?: ResolutionMeta | null;
}) {
  if (!isouhou || guardianDeities == null || kishin == null) {
    return (
      <section className="min-h-24 rounded-lg bg-card p-5" id="section-isouhou">
        <h3 className="mb-4 text-base font-semibold">位相法・守護神/忌神</h3>
        <div className="text-sm text-muted-foreground">実行すると位相法の結果を表示します</div>
      </section>
    );
  }

  return (
    <section className="min-h-24 rounded-lg bg-card p-5" id="section-isouhou">
      <h3 className="mb-4 text-base font-semibold">位相法・守護神/忌神</h3>
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-md border border-border/80 bg-background/60 p-3">
          <div className="mb-2 text-sm font-medium">守護神</div>
          <div className="flex flex-wrap gap-2">
            {guardianDeities.length === 0 ? (
              <span className="text-sm text-muted-foreground">該当なし</span>
            ) : (
              guardianDeities.map((e) => (
                <span key={`g-${e}`} className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs">
                  {elementLabel(e)}
                </span>
              ))
            )}
          </div>
        </div>
        <div className="rounded-md border border-border/80 bg-background/60 p-3">
          <div className="mb-2 text-sm font-medium">忌神</div>
          <div className="flex flex-wrap gap-2">
            {kishin.length === 0 ? (
              <span className="text-sm text-muted-foreground">該当なし</span>
            ) : (
              kishin.map((e) => (
                <span key={`k-${e}`} className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs">
                  {elementLabel(e)}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
      {isouhou.length === 0 ? (
        <div className="text-sm text-muted-foreground">位相法エントリはありません</div>
      ) : (
        <div className="flex flex-col gap-2">
          {isouhou.map((e, idx) => (
            <div key={`${e.kind}:${idx}`} className="rounded-md border border-border/80 bg-background/60 p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">{e.kind}</div>
                {typeof e.strength === "number" && (
                  <div className="text-xs text-muted-foreground">強度: {e.strength}</div>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                {e.scope !== undefined && <span>scope: {e.scope}</span>}
                {e.hasCentralBranch === true && <span>hasCentralBranch</span>}
                {e.involved && e.involved.length > 0 && (
                  <span className="break-all">involved: {e.involved.join(", ")}</span>
                )}
              </div>
              {typeof e.strength === "number" && (
                <div className="mt-2">
                  <div className="h-2 w-full rounded bg-slate-100">
                    <div
                      className="h-2 rounded bg-blue-500"
                      style={{ width: `${Math.max(0, Math.min(100, e.strength * 10))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {resolutionMeta && (
        <div className="mt-4 rounded-md border border-dashed border-border/90 bg-muted/20 p-3 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">resolutionMeta（Layer3a）</div>
          <ul className="mt-2 space-y-1">
            <li>ruleSetId: {resolutionMeta.ruleSetId}</li>
            <li>priorityVersion: {resolutionMeta.priorityVersion}</li>
            <li>sourceLevel: {resolutionMeta.sourceLevel}</li>
          </ul>
        </div>
      )}
    </section>
  );
}
