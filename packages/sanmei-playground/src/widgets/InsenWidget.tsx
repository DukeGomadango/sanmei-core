import type { InsenLayer2 } from "@sanmei/sanmei-core";
import { stemColorClasses, stemLabel, branchLabel } from "../lib/dictionaries";

type Zokan = InsenLayer2["year"]["zokan"];

function slotJa(slot: Zokan["activeSlot"]): string {
  const m: Record<Zokan["activeSlot"], string> = {
    ZOUKAN_SHOGEN: "初元",
    ZOUKAN_CHUGEN: "中元",
    ZOUKAN_HONGEN: "本元",
  };
  return m[slot];
}

function ZokanBlock({ zokan }: { zokan: Zokan }) {
  return (
    <div className="mt-2 space-y-1 rounded-md border border-border/60 bg-muted/20 p-2 text-[11px] leading-snug">
      <div className="text-muted-foreground">
        蔵干: 初{stemLabel(zokan.zoukanShogen)} / 中{stemLabel(zokan.zoukanChugen)} / 本{stemLabel(zokan.zoukanHongen)}
      </div>
      <div>
        採用: <span className="font-medium">{slotJa(zokan.activeSlot)}</span> →{" "}
        <span className="font-semibold">{stemLabel(zokan.activeStem)}</span>
      </div>
    </div>
  );
}

export function InsenWidget({ insen }: { insen: InsenLayer2 | null }) {
  if (!insen) {
    return (
      <section className="min-h-56 rounded-lg bg-card p-5" id="section-insen">
        <h3 className="mb-4 text-base font-semibold">陰占（命式）</h3>
        <div className="text-sm text-muted-foreground">実行すると陰占（命式）を表示します</div>
      </section>
    );
  }

  const pillars = [
    { label: "年", pillar: insen.year },
    { label: "月", pillar: insen.month },
    { label: "日", pillar: insen.day },
  ] as const;

  return (
    <section className="min-h-56 rounded-lg bg-card p-5" id="section-insen">
      <h3 className="mb-4 text-base font-semibold">陰占（命式）</h3>

      <div
        className="mb-4 rounded-md border border-sky-200/80 bg-sky-50/40 p-3 text-sm"
        title="蔵干テーブルと照合するのは displayDepth（暦日差 rawDelta にオフセットを加えた表示用の深さ）です。"
      >
        <div className="font-medium text-sky-950">深さ（蔵干判定）</div>
        <div className="mt-1 grid gap-1 text-xs text-sky-900/90 md:grid-cols-2">
          <span>
            <span className="text-muted-foreground">rawDelta: </span>
            <span className="font-mono font-semibold">{insen.rawDelta}</span>
          </span>
          <span>
            <span className="text-muted-foreground">displayDepth（テーブル照合用）: </span>
            <span className="font-mono font-semibold">{insen.displayDepth}</span>
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          v1 既定では displayDepth = rawDelta + 1（節入り当日は rawDelta=0 → displayDepth=1）。ruleset 側の「何日目まで初元か」はこの
          displayDepth と一致させます。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {pillars.map((p) => {
          const c = stemColorClasses(p.pillar.stem);
          return (
            <div key={p.label} className={`rounded-md border border-l-4 p-2.5 pl-3 ${c.border} ${c.bg}`}>
              <div className="text-xs font-medium text-muted-foreground">{p.label}柱</div>
              <div className={`mt-0.5 text-lg font-semibold ${c.text}`}>
                {stemLabel(p.pillar.stem)}
                {branchLabel(p.pillar.branch)}
              </div>
              <ZokanBlock zokan={p.pillar.zokan} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
