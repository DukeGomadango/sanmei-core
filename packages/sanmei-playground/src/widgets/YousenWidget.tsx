import { useMemo, useState } from "react";
import type { BaseProfileLayer2, InteractionRulesLayer2 } from "@sanmei/sanmei-core";
import { Dict } from "../lib/dictionaries";
import { Badge } from "../components/ui/badge";

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
      <section className="min-h-56 rounded-lg bg-card p-5">
        <h3 className="mb-4 text-base font-semibold">陽占（人体星図）</h3>
        <div className="text-sm text-muted-foreground">左側で入力して実行すると、陽占を表示します</div>
      </section>
    );
  }

  const lineStyle = useShadow ? "stroke-dashed" : "stroke-solid";

  const center = { x: 50, y: 42 };
  const mainByPart = new Map(activeYousen.mainStars.map((s) => [s.part, s.starId]));
  const parts = ["HEAD", "CHEST", "BELLY", "RIGHT_HAND", "LEFT_HAND"] as const;

  // 主星ラベル（Badge / Pill）を HTML で配置して、SVG上の可変長テキスト重なりを避ける。
  const mainBadgeClass = useShadow
    ? "border-cyan-200 bg-cyan-50 text-cyan-950 shadow-sm"
    : "border-slate-300 bg-white text-slate-900 shadow-sm";

  const subBadgeClass = useShadow
    ? "border-amber-200 bg-amber-50 text-amber-950 shadow-sm"
    : "border-slate-300 bg-white text-slate-900 shadow-sm";

  const subByAnchor = new Map(activeYousen.subordinateStars.map((s) => [s.anchor, s.starId] as const));

  const subordinateDotPosByAnchor: Record<"YEAR_BRANCH" | "MONTH_BRANCH" | "DAY_BRANCH", { x: number; y: number }> = {
    YEAR_BRANCH: { x: 50, y: 32 },
    MONTH_BRANCH: { x: 34, y: 70 },
    DAY_BRANCH: { x: 66, y: 70 },
  };

  return (
    <section className="min-h-56 rounded-lg bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">陽占（人体星図）</h3>
        {hasShadow && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>虚気</span>
            <input type="checkbox" checked={useShadow} onChange={(e) => setUseShadow(e.target.checked)} />
          </label>
        )}
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-start">
        {/* SVGは人体の骨格だけ担当。星ラベルはHTMLオーバーレイで配置する。 */}
        <div className="relative h-56 w-full overflow-hidden">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
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
            fill={useShadow ? "rgba(15, 23, 42, 0.72)" : "rgb(248, 250, 252)"}
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
                className={`stroke-[1.5] ${lineStyle} ${useShadow ? "stroke-cyan-300/85" : "stroke-slate-500/70"}`}
                filter={useShadow ? "url(#glow)" : undefined}
              />
            );
          })}

          {/* main markers (テキストはHTML側に逃がして重なりを回避) */}
          {parts.map((p) => {
            const pos = partPos(p);
            const starId = mainByPart.get(p);
            if (!starId) return null;
            return <circle key={p} cx={pos.x} cy={pos.y} r={2.1} className={useShadow ? "fill-cyan-200" : "fill-slate-400"} />;
          })}

          {/* subordinate markers */}
          {activeYousen.subordinateStars.map((s) => {
            const pos = subordinateDotPosByAnchor[s.anchor];
            return (
              <circle
                key={`${s.anchor}:${s.starId}`}
                cx={pos.x}
                cy={pos.y}
                r={1.9}
                className={useShadow ? "fill-amber-200" : "fill-amber-500/40"}
              />
            );
          })}
          </svg>

          {/* 主星ラベル（十字の目視しやすさを優先してHTMLグリッドで配置） */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 place-items-center px-2">
            {/* HEAD */}
            <div className="col-start-2 row-start-1">
              {mainByPart.get("HEAD") && (
                <Badge className={`${mainBadgeClass} px-2.5 py-1 text-sm leading-tight text-center`}>{Dict.starLabel(mainByPart.get("HEAD")!)}</Badge>
              )}
            </div>

            {/* CHEST + YEAR_BRANCH */}
            <div className="col-start-2 row-start-2 flex flex-col items-center gap-1">
              {mainByPart.get("CHEST") && (
                <Badge className={`${mainBadgeClass} border-2 border-sky-300 px-2.5 py-1 text-sm leading-tight text-center`}>{Dict.starLabel(mainByPart.get("CHEST")!)}</Badge>
              )}
              {subByAnchor.get("YEAR_BRANCH") && (
                <Badge className={`${subBadgeClass} px-2 py-0.5 text-xs leading-tight text-center`}>{Dict.starLabel(subByAnchor.get("YEAR_BRANCH")!)}</Badge>
              )}
            </div>

            {/* BELLY */}
            <div className="col-start-2 row-start-3">
              {mainByPart.get("BELLY") && (
                <Badge className={`${mainBadgeClass} px-2.5 py-1 text-sm leading-tight text-center`}>{Dict.starLabel(mainByPart.get("BELLY")!)}</Badge>
              )}
            </div>

            {/* LEFT_HAND / RIGHT_HAND */}
            <div className="col-start-1 row-start-2">
              {mainByPart.get("LEFT_HAND") && (
                <Badge className={`${mainBadgeClass} px-2.5 py-1 text-sm leading-tight text-center`}>{Dict.starLabel(mainByPart.get("LEFT_HAND")!)}</Badge>
              )}
            </div>
            <div className="col-start-3 row-start-2">
              {mainByPart.get("RIGHT_HAND") && (
                <Badge className={`${mainBadgeClass} px-2.5 py-1 text-sm leading-tight text-center`}>{Dict.starLabel(mainByPart.get("RIGHT_HAND")!)}</Badge>
              )}
            </div>

            {/* MONTH_BRANCH / DAY_BRANCH */}
            <div className="col-start-1 row-start-3">
              {subByAnchor.get("MONTH_BRANCH") && (
                <Badge className={`${subBadgeClass} px-2 py-0.5 text-xs leading-tight text-center`}>{Dict.starLabel(subByAnchor.get("MONTH_BRANCH")!)}</Badge>
              )}
            </div>
            <div className="col-start-3 row-start-3">
              {subByAnchor.get("DAY_BRANCH") && (
                <Badge className={`${subBadgeClass} px-2 py-0.5 text-xs leading-tight text-center`}>{Dict.starLabel(subByAnchor.get("DAY_BRANCH")!)}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

