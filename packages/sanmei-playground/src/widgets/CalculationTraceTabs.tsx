import { useMemo, useState } from "react";
import type { CalculateResult } from "@sanmei/sanmei-core";
import { buildLayerRows, type TraceRow } from "../lib/traceTransformer";

type TabId = "layer1" | "layer2" | "layer3" | "raw";

function TraceTable({ rows }: { rows: TraceRow[] }) {
  if (rows.length === 0) {
    return <div className="text-sm text-muted-foreground">表示できるトレースがありません（権限または設定を確認してください）。</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-2 py-2 font-semibold">処理段階</th>
            <th className="px-2 py-2 font-semibold">判定</th>
            <th className="px-2 py-2 font-semibold">Rule ID</th>
            <th className="px-2 py-2 font-semibold">根拠（入力/条件）</th>
            <th className="px-2 py-2 font-semibold">結果</th>
            <th className="px-2 py-2 font-semibold">採用理由</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.stepLabel}-${i}`} className="border-b border-border/70 align-top">
              <td className="px-2 py-2 whitespace-nowrap">{r.phaseLabel}</td>
              <td className="px-2 py-2 whitespace-nowrap">{r.stepLabel}</td>
              <td className="px-2 py-2 whitespace-nowrap">{r.ruleId}</td>
              <td className="px-2 py-2">
                <ul className="space-y-1">
                  {r.inputItems.map((it) => (
                    <li key={it} className="whitespace-nowrap text-xs md:text-sm">
                      {it}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-2 py-2">
                <ul className="space-y-1">
                  {r.resultItems.map((it) => (
                    <li key={it} className="whitespace-nowrap text-xs md:text-sm">
                      {it}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-2 py-2 whitespace-nowrap">{r.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CalculationTraceTabs({ data }: { data: CalculateResult | null | undefined }) {
  const [tab, setTab] = useState<TabId>("layer1");
  const rows = useMemo(() => buildLayerRows(data), [data]);
  const rawJson = useMemo(() => JSON.stringify(data ?? {}, null, 2), [data]);

  const labels: { id: TabId; label: string }[] = [
    { id: "layer1", label: "暦と基礎データ" },
    { id: "layer2", label: "静的命式・Core Models" },
    { id: "layer3", label: "動的タイムライン" },
    { id: "raw", label: "Raw JSON / Debug Trace" },
  ];

  return (
    <section className="rounded-lg border border-border/90 bg-card p-5">
      <h2 className="mb-4 text-base font-semibold">途中式・算出根拠</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {labels.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`rounded-md border px-3 py-1.5 text-sm ${
              tab === t.id
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-background text-muted-foreground"
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "layer1" && <TraceTable rows={rows.layer1} />}
      {tab === "layer2" && <TraceTable rows={rows.layer2} />}
      {tab === "layer3" && <TraceTable rows={rows.layer3} />}
      {tab === "raw" && (
        <pre className="max-h-[460px] overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs">
          {rawJson}
        </pre>
      )}
    </section>
  );
}
