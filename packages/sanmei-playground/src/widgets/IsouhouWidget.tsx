import type { InteractionRulesLayer2 } from "@sanmei/sanmei-core";

type IsouhouEntry = InteractionRulesLayer2["isouhou"][number];

export function IsouhouWidget({ isouhou }: { isouhou: IsouhouEntry[] | null }) {
  if (!isouhou) {
    return (
      <section className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 text-base font-semibold">位相法</h3>
        <div className="text-sm text-muted-foreground">応答を待っています</div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-base font-semibold">位相法</h3>
      {isouhou.length === 0 ? (
        <div className="text-sm text-muted-foreground">該当なし</div>
      ) : (
        <div className="flex flex-col gap-2">
          {isouhou.map((e, idx) => (
            <div key={`${e.kind}:${idx}`} className="rounded-md border p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">{e.kind}</div>
                {typeof e.strength === "number" && (
                  <div className="text-xs text-muted-foreground">strength: {e.strength}</div>
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

