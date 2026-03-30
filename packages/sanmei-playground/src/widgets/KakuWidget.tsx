import type { InteractionRulesLayer2 } from "@sanmei/sanmei-core";

type Kaku = NonNullable<InteractionRulesLayer2["kaku"]>;

export function KakuWidget({ kaku }: { kaku: Kaku | null | undefined }) {
  if (!kaku) {
    return (
      <section className="min-h-32 rounded-lg bg-card p-5" id="section-kaku">
        <h3 className="mb-4 text-base font-semibold">格法（kaku）</h3>
        <div className="text-sm text-muted-foreground">この ruleset では候補が返っていないか、未実行です。</div>
      </section>
    );
  }

  return (
    <section className="min-h-32 rounded-lg bg-card p-5" id="section-kaku">
      <h3 className="mb-4 text-base font-semibold">格法（kaku）</h3>

      <div className="mb-4 rounded-md border border-border/80 bg-background/60 p-3 text-xs">
        <div className="font-medium text-foreground">meta</div>
        <ul className="mt-2 grid gap-1 text-muted-foreground md:grid-cols-2">
          <li>ruleSetId: {kaku.meta.ruleSetId}</li>
          <li>priorityVersion: {kaku.meta.priorityVersion}</li>
          <li>sourceLevel: {kaku.meta.sourceLevel}</li>
          <li>allowGohouInKakuApplied: {String(kaku.meta.allowGohouInKakuApplied)}</li>
          <li>evaluateShadowProfileApplied: {String(kaku.meta.evaluateShadowProfileApplied)}</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-semibold">候補（candidates）</h4>
          {kaku.candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">なし</p>
          ) : (
            <ul className="space-y-2">
              {kaku.candidates.map((c) => (
                <li key={c.id} className="rounded-md border border-border/70 p-2 text-sm">
                  <div className="font-medium">
                    {c.label}{" "}
                    <span className="text-xs font-normal text-muted-foreground">({c.id}) priority={c.priority}</span>
                  </div>
                  {c.reasons.length > 0 && (
                    <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                      {c.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">採用（resolved）</h4>
          {kaku.resolved.length === 0 ? (
            <p className="text-sm text-muted-foreground">なし</p>
          ) : (
            <ul className="space-y-2">
              {kaku.resolved.map((c) => (
                <li key={`r-${c.id}`} className="rounded-md border border-emerald-200/80 bg-emerald-50/50 p-2 text-sm">
                  <div className="font-medium">{c.label}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">抑制（suppressed）</h4>
          {kaku.suppressed.length === 0 ? (
            <p className="text-sm text-muted-foreground">なし</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {kaku.suppressed.map((s) => (
                <li key={s.id} className="rounded border border-rose-100 bg-rose-50/40 px-2 py-1">
                  <span className="font-medium">{s.id}</span>{" "}
                  <span className="text-xs text-muted-foreground">({s.reasonCode})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
