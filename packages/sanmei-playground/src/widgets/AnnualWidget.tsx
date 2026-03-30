import type { AnnualTimeline } from "@sanmei/sanmei-core";
import { indexToStemBranch } from "@sanmei/sanmei-core/sexagenary";
import { stemLabel, branchLabel, Dict } from "../lib/dictionaries";

export function AnnualWidget({ annual }: { annual: AnnualTimeline | null | undefined }) {
  if (!annual) {
    return (
      <section className="min-h-40 rounded-lg bg-card p-5" id="section-annual">
        <h3 className="mb-4 text-base font-semibold">年運（annual）</h3>
        <div className="text-sm text-muted-foreground">未実行です。</div>
      </section>
    );
  }

  const { stem, branch } = indexToStemBranch(annual.sexagenaryIndex);

  return (
    <section className="min-h-40 rounded-lg bg-card p-5" id="section-annual">
      <h3 className="mb-4 text-base font-semibold">年運（annual）</h3>
      <dl className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">暦年（calendarYear）</dt>
          <dd className="font-medium">{annual.calendarYear}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">六十甲子</dt>
          <dd className="font-semibold whitespace-nowrap">
            {stemLabel(stem)}
            {branchLabel(branch)}
            <span className="ml-2 text-xs font-normal text-muted-foreground">index={annual.sexagenaryIndex}</span>
          </dd>
        </div>
        <div className="md:col-span-2">
          <dt className="text-muted-foreground">relatedStarId</dt>
          <dd className="break-all font-mono text-xs">{annual.relatedStarId}</dd>
          <dd className="mt-1 text-xs text-muted-foreground">{Dict.starLabel(annual.relatedStarId)}</dd>
        </div>
      </dl>
    </section>
  );
}
