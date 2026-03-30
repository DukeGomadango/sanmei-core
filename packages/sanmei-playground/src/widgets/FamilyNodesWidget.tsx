import type { FamilyNode } from "@sanmei/sanmei-core";
import { formatFamilyNodeRow } from "../lib/familyNodeDisplay";
import { stemLabel } from "../lib/dictionaries";

export function FamilyNodesWidget({
  nodes,
  hasCalculateResult,
}: {
  nodes: FamilyNode[] | null | undefined;
  hasCalculateResult: boolean;
}) {
  if (!hasCalculateResult) {
    return (
      <section className="min-h-32 rounded-lg bg-card p-5" id="section-family-nodes">
        <h3 className="mb-4 text-base font-semibold">六親（familyNodes）</h3>
        <div className="text-sm text-muted-foreground">計算を実行すると表示されます。</div>
      </section>
    );
  }

  if (!nodes || nodes.length === 0) {
    return (
      <section className="min-h-32 rounded-lg bg-card p-5" id="section-family-nodes">
        <h3 className="mb-4 text-base font-semibold">六親（familyNodes）</h3>
        <div className="text-sm text-muted-foreground">この結果では六親ノードが空です（ruleset 未対応または条件により 0 件）。</div>
      </section>
    );
  }

  return (
    <section className="min-h-32 rounded-lg bg-card p-5" id="section-family-nodes">
      <h3 className="mb-4 text-base font-semibold">六親（familyNodes）</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-2 py-2 font-semibold">役</th>
              <th className="px-2 py-2 font-semibold">干</th>
              <th className="px-2 py-2 font-semibold">対象柱</th>
              <th className="px-2 py-2 font-semibold">スロット</th>
              <th className="px-2 py-2 font-semibold">座標（要約）</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((n, i) => {
              const r = formatFamilyNodeRow(n);
              return (
                <tr key={`${n.role}-${i}`} className="border-b border-border/70">
                  <td className="px-2 py-2">{r.role}</td>
                  <td className="px-2 py-2 font-medium">{stemLabel(n.stem)}</td>
                  <td className="px-2 py-2 whitespace-nowrap">{r.pillarCol}</td>
                  <td className="px-2 py-2 whitespace-nowrap">{r.slotCol}</td>
                  <td className="px-2 py-2">
                    <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs whitespace-nowrap">
                      {r.badge}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
