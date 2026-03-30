export function TenchuSatsuStatusWidget({ tenchu }: { tenchu: Record<string, unknown> | null | undefined }) {
  if (!tenchu) {
    return (
      <section className="min-h-56 rounded-lg bg-card p-5">
        <h3 className="mb-4 text-base font-semibold">天中殺ステータス</h3>
        <div className="text-sm text-muted-foreground">実行すると天中殺ステータスを表示します</div>
      </section>
    );
  }

  const entries = Object.entries(tenchu);

  return (
    <section className="min-h-56 rounded-lg bg-card p-5">
      <h3 className="mb-4 text-base font-semibold">天中殺ステータス</h3>
      {entries.length === 0 ? (
        <div className="text-sm text-muted-foreground">該当なし</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {entries.map(([k, v]) => {
            const valueText =
              v == null || typeof v === "string" || typeof v === "number" || typeof v === "boolean"
                ? String(v)
                : JSON.stringify(v, null, 2);
            return (
              <div key={k} className="min-w-[12rem] flex-1 rounded-md border border-border/80 bg-background/60 p-2">
                <div className="text-xs text-muted-foreground">{k}</div>
                <pre className="mt-1 whitespace-pre-wrap break-words text-xs">{valueText}</pre>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

