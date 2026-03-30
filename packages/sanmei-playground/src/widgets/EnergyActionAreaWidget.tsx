import type { EnergyData } from "@sanmei/sanmei-core";

function polygonPointsFromVertexAngles(vertexAnglesDegTenths: readonly [number, number, number]) {
  const cx = 50;
  const cy = 50;
  const r = 35;

  const pts = vertexAnglesDegTenths.map((t) => {
    const deg = t / 10;
    const rad = (deg * Math.PI) / 180;
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return pts.join(" ");
}

const SIZE_TO_STYLE: Array<{ fillOpacity: number; strokeWidth: number }> = [
  { fillOpacity: 0.25, strokeWidth: 1 },
  { fillOpacity: 0.35, strokeWidth: 1.2 },
  { fillOpacity: 0.5, strokeWidth: 1.5 },
  { fillOpacity: 0.7, strokeWidth: 1.8 },
];

export function EnergyActionAreaWidget({ energy }: { energy: EnergyData | null }) {
  if (!energy) {
    return (
      <section className="min-h-56 rounded-lg bg-card p-5">
        <h3 className="mb-4 text-base font-semibold">行動領域（宇宙盤）</h3>
        <div className="text-sm text-muted-foreground">実行すると行動領域を表示します</div>
      </section>
    );
  }

  const points = polygonPointsFromVertexAngles(energy.actionAreaGeometry.vertexAnglesDegTenths);
  const style = SIZE_TO_STYLE[energy.actionAreaSize - 1] ?? SIZE_TO_STYLE[0]!;

  return (
    <section className="min-h-56 rounded-lg bg-card p-5">
      <h3 className="mb-4 text-base font-semibold">行動領域（宇宙盤）</h3>
      <div className="flex flex-col gap-2">
        <svg viewBox="0 0 100 100" className="h-56 w-full">
          <defs>
            <linearGradient id="actionAreaFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgb(56 189 248)" stopOpacity={Math.min(0.9, style.fillOpacity + 0.15)} />
              <stop offset="60%" stopColor="rgb(20 184 166)" stopOpacity={style.fillOpacity} />
              <stop offset="100%" stopColor="rgb(99 102 241)" stopOpacity={Math.max(0.1, style.fillOpacity - 0.05)} />
            </linearGradient>
          </defs>

          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="rgba(148, 163, 184, 0.5)"
            strokeWidth="1"
          />
          {/* compass cross lines (密度を上げすぎない) */}
          <line x1="50" y1="8" x2="50" y2="92" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="1" />
          <line x1="8" y1="50" x2="92" y2="50" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="1" />
          <line x1="18" y1="18" x2="82" y2="82" stroke="rgba(148, 163, 184, 0.22)" strokeWidth="1" />
          <line x1="82" y1="18" x2="18" y2="82" stroke="rgba(148, 163, 184, 0.22)" strokeWidth="1" />

          <polygon
            points={points}
            stroke="rgba(56, 189, 248, 0.8)"
            strokeWidth={style.strokeWidth}
            fill="url(#actionAreaFill)"
          />
        </svg>
        <div className="text-xs text-muted-foreground">
          行動領域サイズ: {energy.actionAreaSize} / 面積比: {energy.actionAreaGeometry.areaRatioPermille}
        </div>
      </div>
    </section>
  );
}

