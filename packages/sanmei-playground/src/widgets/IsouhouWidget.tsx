import type { InteractionRulesLayer2 } from "@sanmei/sanmei-core";

type IsouhouEntry = InteractionRulesLayer2["isouhou"][number];

export function IsouhouWidget({ isouhou }: { isouhou: IsouhouEntry[] | null }) {
  if (!isouhou) {
    return (
      <section className="min-h-24 rounded-lg bg-card p-5">
        <h3 className="mb-4 text-base font-semibold">位相法</h3>
        <div className="text-sm text-muted-foreground">実行すると位相法の結果を表示します</div>
      </section>
    );
  }

  return (
    <section className="min-h-24 rounded-lg bg-card p-5">
      <h3 className="mb-4 text-base font-semibold">位相法</h3>
      {isouhou.length === 0 ? (
        <div className="text-sm text-muted-foreground">該当なし</div>
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
    </section>
  );
}

