import type { Stem } from "../layer1/enums.js";
import type { RulesetMockV1 } from "../schemas/rulesetMockV1.js";
import type { FamilyNode } from "../schemas/layer2.js";
import { getStemCharFromId } from "./stemBranchKey.js";

function offsetStem(dayStem: Stem, offset: number): Stem {
  return (((dayStem + offset) % 10) + 10) % 10 as Stem;
}

export function resolveFamilyNodes(dayStem: Stem, ruleset: RulesetMockV1): FamilyNode[] {
  const dc = getStemCharFromId(dayStem);
  const out: FamilyNode[] = [];
  for (const rule of ruleset.familyRules.mockV1Nodes) {
    if (rule.whenDayStem !== dc) continue;
    out.push({
      role: rule.role,
      stem: offsetStem(dayStem, rule.relativeStemOffset),
      location: {
        pillar: rule.locationPillar,
        slot: rule.locationSlot,
      },
    });
  }
  return out;
}
