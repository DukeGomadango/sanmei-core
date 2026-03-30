import type { Branch, Stem } from "../layer1/enums.js";
import { Element } from "../layer1/enums.js";
import { STEM_ELEMENT } from "../layer1/stemBranchTables.js";
import type { InsenLayer2 } from "../schemas/layer2.js";
import type { BundledRuleset } from "../schemas/rulesetMockV1.js";
import { getStemCharFromId } from "./stemBranchKey.js";
import { areaRatioPermilleFromVertexTenths, vertexAnglesDegTenthsForPillars } from "./l2cGeometry.js";

function weightForStem(stem: Stem, weights: BundledRuleset["energyWeights"]): number {
  const ch = getStemCharFromId(stem);
  return weights[ch as keyof typeof weights];
}

function actionAreaSizeFromTotal(
  total: number,
  thresholds: readonly [number, number, number],
): 1 | 2 | 3 | 4 {
  const [t1, t2, t3] = thresholds;
  if (total <= t1) return 1;
  if (total <= t2) return 2;
  if (total <= t3) return 3;
  return 4;
}

function elementKeyFromStem(stem: Stem): "WOOD" | "FIRE" | "EARTH" | "METAL" | "WATER" {
  const element = STEM_ELEMENT[stem];
  if (element === Element.WOOD) return "WOOD";
  if (element === Element.FIRE) return "FIRE";
  if (element === Element.EARTH) return "EARTH";
  if (element === Element.METAL) return "METAL";
  return "WATER";
}

/** L2c: 素の三柱＋蔵干（採用干）のみ。位相・虚気は参照しない。 */
export function resolveEnergyData(insen: InsenLayer2, ruleset: BundledRuleset) {
  const w = ruleset.energyWeights;
  const stems: Stem[] = [
    insen.year.stem as Stem,
    insen.month.stem as Stem,
    insen.day.stem as Stem,
    insen.year.zokan.activeStem as Stem,
    insen.month.zokan.activeStem as Stem,
    insen.day.zokan.activeStem as Stem,
  ];
  const energyByElement = {
    WOOD: 0,
    FIRE: 0,
    EARTH: 0,
    METAL: 0,
    WATER: 0,
  };
  let totalEnergy = 0;
  for (const s of stems) {
    const weight = weightForStem(s, w);
    totalEnergy += weight;
    const key = elementKeyFromStem(s);
    energyByElement[key] += weight;
  }
  const actionAreaSize = actionAreaSizeFromTotal(totalEnergy, ruleset.energyMock.actionAreaThresholds);
  const vertexAnglesDegTenths = vertexAnglesDegTenthsForPillars(
    { stem: insen.year.stem as Stem, branch: insen.year.branch as Branch },
    { stem: insen.month.stem as Stem, branch: insen.month.branch as Branch },
    { stem: insen.day.stem as Stem, branch: insen.day.branch as Branch },
  );
  const areaRatioPermille = areaRatioPermilleFromVertexTenths(vertexAnglesDegTenths);
  return {
    totalEnergy,
    energyByElement,
    actionAreaSize,
    actionAreaGeometry: {
      vertexAnglesDegTenths,
      areaRatioPermille,
    },
  };
}
