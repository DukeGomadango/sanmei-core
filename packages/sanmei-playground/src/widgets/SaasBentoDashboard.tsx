import type { ReactNode } from "react";
import type { CalculateResult } from "@sanmei/sanmei-core";

import { BentoTileWrapper } from "./SaasBentoTileWrapper";
import { EnergyActionAreaWidget } from "./EnergyActionAreaWidget";
import { InsenWidget } from "./InsenWidget";
import { IsouhouWidget } from "./IsouhouWidget";
import { TimelineWidget } from "./TimelineWidget";
import { YousenWidget } from "./YousenWidget";
import { TenchuSatsuStatusWidget } from "./TenchuSatsuStatusWidget";
import { CalculationTraceTabs } from "./CalculationTraceTabs";
import { DestinyBugsWidget } from "./DestinyBugsWidget";
import { FamilyNodesWidget } from "./FamilyNodesWidget";
import { AnnualWidget } from "./AnnualWidget";
import { KakuWidget } from "./KakuWidget";
import { ResultMetaBar } from "./ResultMetaBar";

type Props = {
  data: CalculateResult | null | undefined;
};

function SectionTitle({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-4 text-lg font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

export function SaasBentoDashboard({ data }: Props) {
  const hasCalculateResult = data != null;
  const insen = data?.baseProfile.insen ?? null;
  const yousen = data?.baseProfile.yousen ?? null;
  const kyoki = data?.interactionRules.kyoki ?? null;
  const energy = data?.baseProfile.energyData ?? null;
  const isouhou = data?.interactionRules.isouhou ?? null;
  const guardianDeities = data?.interactionRules.guardianDeities ?? null;
  const kishin = data?.interactionRules.kishin ?? null;
  const resolutionMeta = data?.interactionRules.resolutionMeta ?? null;
  const kaku = data?.interactionRules.kaku ?? null;
  const daiun = data?.dynamicTimeline.daiun ?? null;
  const annual = data?.dynamicTimeline.annual ?? null;
  const tenchu = data?.dynamicTimeline.tenchuSatsuStatus ?? null;
  const destinyBugs = data?.baseProfile.destinyBugs ?? null;
  const familyNodes = data?.baseProfile.familyNodes ?? null;

  return (
    <div className="space-y-10">
      <ResultMetaBar meta={data?.meta} />

      <section className="space-y-4" aria-labelledby="heading-static">
        <SectionTitle id="heading-static">静的命式</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          <div className="md:col-span-12">
            <BentoTileWrapper tone="secondary">
              <InsenWidget insen={insen} />
            </BentoTileWrapper>
          </div>
          <div className="md:col-span-8">
            <BentoTileWrapper tone="primary">
              <YousenWidget yousen={yousen} kyoki={kyoki} starLabels={data?.meta.display?.starLabels} />
            </BentoTileWrapper>
          </div>
          <div className="md:col-span-4">
            <BentoTileWrapper tone="secondary">
              <DestinyBugsWidget codes={destinyBugs} hasCalculateResult={hasCalculateResult} />
            </BentoTileWrapper>
          </div>
          <div className="md:col-span-12">
            <BentoTileWrapper>
              <FamilyNodesWidget nodes={familyNodes} hasCalculateResult={hasCalculateResult} />
            </BentoTileWrapper>
          </div>
          <div className="md:col-span-12">
            <BentoTileWrapper tone="accent">
              <EnergyActionAreaWidget energy={energy} />
            </BentoTileWrapper>
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="heading-timeline">
        <SectionTitle id="heading-timeline">動的運勢</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          <div className="md:col-span-7">
            <BentoTileWrapper>
              <TimelineWidget daiun={daiun} />
            </BentoTileWrapper>
          </div>
          <div className="md:col-span-5">
            <BentoTileWrapper>
              <AnnualWidget annual={annual} />
            </BentoTileWrapper>
          </div>
          <div className="md:col-span-12">
            <BentoTileWrapper>
              <TenchuSatsuStatusWidget tenchu={tenchu} hasCalculateResult={hasCalculateResult} />
            </BentoTileWrapper>
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="heading-rules">
        <SectionTitle id="heading-rules">ルール解決（位相・格法）</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:gap-5">
          <BentoTileWrapper tone="accent">
            <IsouhouWidget
              isouhou={isouhou}
              guardianDeities={guardianDeities}
              kishin={kishin}
              resolutionMeta={resolutionMeta}
            />
          </BentoTileWrapper>
          <BentoTileWrapper>
            <KakuWidget kaku={kaku} />
          </BentoTileWrapper>
        </div>
      </section>

      <CalculationTraceTabs data={data} />
    </div>
  );
}
