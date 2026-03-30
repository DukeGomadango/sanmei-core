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
      <section className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 text-base font-semibold">行動領域（宇宙盤）</h3>
        <div className="text-sm text-muted-foreground">応答を待っています</div>
      </section>
    );
  }

  const points = polygonPointsFromVertexAngles(energy.actionAreaGeometry.vertexAnglesDegTenths);
  const style = SIZE_TO_STYLE[energy.actionAreaSize - 1] ?? SIZE_TO_STYLE[0]!;

  return (
    <section className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-base font-semibold">行動領域（宇宙盤）</h3>
      <div className="flex flex-col gap-2">
        <svg viewBox="0 0 100 100" className="h-64 w-full">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="rgba(148, 163, 184, 0.55)"
            strokeWidth="1"
          />
          <polygon
            points={points}
            className="stroke-sky-500"
            strokeWidth={style.strokeWidth}
            fill={`rgba(14, 165, 233, ${style.fillOpacity})`}
          />
        </svg>
        <div className="text-xs text-muted-foreground">
          actionAreaSize: {energy.actionAreaSize} / areaRatioPermille: {energy.actionAreaGeometry.areaRatioPermille}
        </div>
      </div>
    </section>
  );
}

