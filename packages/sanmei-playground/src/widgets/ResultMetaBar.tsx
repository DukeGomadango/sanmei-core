import type { CalculateResult } from "@sanmei/sanmei-core";

export function ResultMetaBar({ meta }: { meta: CalculateResult["meta"] | null | undefined }) {
  if (!meta) return null;

  return (
    <div id="section-meta" className="rounded-lg border border-border/90 bg-card p-5">
      <h2 className="mb-3 text-base font-semibold">計算メタ</h2>
      <dl className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">engineVersion</dt>
          <dd className="font-mono text-xs">{meta.engineVersion}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">rulesetVersion</dt>
          <dd className="font-mono text-xs">{meta.rulesetVersion}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">sect</dt>
          <dd className="font-mono text-xs">{meta.sect}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">calculatedAt</dt>
          <dd className="font-mono text-xs break-all">{meta.calculatedAt}</dd>
        </div>
      </dl>
      {meta.warnings && meta.warnings.length > 0 && (
        <div className="mt-4 rounded-md border border-amber-300/80 bg-amber-50/80 p-3">
          <div className="text-sm font-semibold text-amber-950">warnings</div>
          <ul className="mt-2 list-inside list-disc text-xs text-amber-900">
            {meta.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
