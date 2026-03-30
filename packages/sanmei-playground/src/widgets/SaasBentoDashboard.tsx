import type { CalculateResult } from "@sanmei/sanmei-core";

import { BentoTileWrapper } from "./SaasBentoTileWrapper";
import { EnergyActionAreaWidget } from "./EnergyActionAreaWidget";
import { InsenWidget } from "./InsenWidget";
import { IsouhouWidget } from "./IsouhouWidget";
import { TimelineWidget } from "./TimelineWidget";
import { YousenWidget } from "./YousenWidget";
import { TenchuSatsuStatusWidget } from "./TenchuSatsuStatusWidget";

type Props = {
  data: CalculateResult | null | undefined;
};

export function SaasBentoDashboard({ data }: Props) {
  const insen = data?.baseProfile.insen ?? null;
  const yousen = data?.baseProfile.yousen ?? null;
  const kyoki = data?.interactionRules.kyoki ?? null;
  const energy = data?.baseProfile.energyData ?? null;
  const isouhou = data?.interactionRules.isouhou ?? null;
  const daiun = data?.dynamicTimeline.daiun ?? null;
  const tenchu = data?.dynamicTimeline.tenchuSatsuStatus ?? null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5 md:auto-rows-max">
      <div className="md:col-span-8">
        <BentoTileWrapper tone="primary">
          <YousenWidget yousen={yousen} kyoki={kyoki} />
        </BentoTileWrapper>
      </div>

      <div className="md:col-span-4">
        <BentoTileWrapper tone="secondary">
          <InsenWidget insen={insen} />
        </BentoTileWrapper>
      </div>

      <div className="md:col-span-8">
        <BentoTileWrapper tone="accent">
          <IsouhouWidget isouhou={isouhou} />
        </BentoTileWrapper>
      </div>

      <div className="md:col-span-4">
        <BentoTileWrapper tone="secondary">
          <EnergyActionAreaWidget energy={energy} />
        </BentoTileWrapper>
      </div>

      <div className="md:col-span-6">
        <BentoTileWrapper>
          <TimelineWidget daiun={daiun} />
        </BentoTileWrapper>
      </div>

      <div className="md:col-span-6">
        <BentoTileWrapper>
          <TenchuSatsuStatusWidget tenchu={tenchu} />
        </BentoTileWrapper>
      </div>
    </div>
  );
}

