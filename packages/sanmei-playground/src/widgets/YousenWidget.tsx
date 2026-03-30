import { useMemo, useState } from "react";
import type { BaseProfileLayer2, InteractionRulesLayer2 } from "@sanmei/sanmei-core";
import { Dict } from "../lib/dictionaries";

type Kyoki = InteractionRulesLayer2["kyoki"];
type YousenLayer2 = BaseProfileLayer2["yousen"];

function partPos(part: string) {
  // SVG座標（viewBox 0..100）
  switch (part) {
    case "HEAD":
      return { x: 50, y: 18 };
    case "CHEST":
      return { x: 50, y: 38 };
    case "BELLY":
      return { x: 50, y: 60 };
    case "RIGHT_HAND":
      return { x: 70, y: 50 };
    case "LEFT_HAND":
      return { x: 30, y: 50 };
    default:
      return { x: 50, y: 50 };
  }
}

export function YousenWidget({ yousen, kyoki }: { yousen: YousenLayer2 | null; kyoki: Kyoki }) {
  const hasShadow = kyoki != null && typeof kyoki === "object" && (kyoki as { shadowYousen?: YousenLayer2 }).shadowYousen != null;
  const [useShadow, setUseShadow] = useState(false);

  const activeYousen = useMemo(() => {
    if (!useShadow || !hasShadow) return yousen;
    return (kyoki as { shadowYousen: YousenLayer2 }).shadowYousen ?? yousen;
  }, [useShadow, hasShadow, kyoki, yousen]);

  if (!activeYousen) {
    return (
      <section className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 text-base font-semibold">陽占（人体星図）</h3>
        <div className="text-sm text-muted-foreground">応答を待っています</div>
      </section>
    );
  }

  const lineStyle = useShadow ? "stroke-dashed" : "stroke-solid";

  const center = { x: 50, y: 42 };
  const mainByPart = new Map(activeYousen.mainStars.map((s) => [s.part, s.starId]));

  const parts = ["HEAD", "CHEST", "BELLY", "RIGHT_HAND", "LEFT_HAND"] as const;

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">陽占（人体星図）</h3>
        {hasShadow && (
          <label className="flex items-center gap-2 text-sm">
            <span>虚気</span>
            <input type="checkbox" checked={useShadow} onChange={(e) => setUseShadow(e.target.checked)} />
          </label>
        )}
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-start">
        <svg viewBox="0 0 100 100" className="h-64 w-full">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 背景 */}
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            rx="10"
            fill={useShadow ? "rgba(15, 23, 42, 0.75)" : "rgb(248, 250, 252)"}
          />

          {/* lines */}
          {parts.map((p) => {
            const pos = partPos(p);
            return (
              <line
                key={p}
                x1={center.x}
                y1={center.y}
                x2={pos.x}
                y2={pos.y}
                className={`stroke-[1.5] ${lineStyle} ${useShadow ? "stroke-cyan-300/80" : "stroke-slate-400/80"}`}
                filter={useShadow ? "url(#glow)" : undefined}
              />
            );
          })}

          {/* main stars */}
          {parts.map((p) => {
            const pos = partPos(p);
            const starId = mainByPart.get(p);
            if (!starId) return null;
            return (
              <g key={p}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={3.2}
                  className={useShadow ? "fill-cyan-200" : "fill-slate-900"}
                />
                <text
                  x={pos.x}
                  y={pos.y - 7}
                  textAnchor="middle"
                  className={useShadow ? "fill-cyan-100 text-[6px]" : "fill-slate-700 text-[6px]"}
                >
                  {Dict.starLabel(starId)}
                </text>
              </g>
            );
          })}

          {/* subordinate stars */}
          {activeYousen.subordinateStars.map((s) => {
            const anchor = s.anchor;
            const pos =
              anchor === "YEAR_BRANCH"
                ? { x: 50, y: 32 }
                : anchor === "MONTH_BRANCH"
                  ? { x: 34, y: 70 }
                  : { x: 66, y: 70 };
            return (
              <g key={`${s.anchor}:${s.starId}`}>
                <circle cx={pos.x} cy={pos.y} r={2.3} className={useShadow ? "fill-amber-200" : "fill-slate-500"} />
                <text
                  x={pos.x}
                  y={pos.y + 8}
                  textAnchor="middle"
                  className={useShadow ? "fill-amber-100 text-[6px]" : "fill-slate-600 text-[6px]"}
                >
                  {Dict.starLabel(s.starId)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

