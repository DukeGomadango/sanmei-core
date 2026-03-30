import type { Branch, Stem } from "../layer1/enums.js";
import type { RulesetMockV1 } from "../schemas/rulesetMockV1.js";
import { SanmeiError, SanmeiErrorCode } from "../errors/sanmeiError.js";
import { getBranchCharFromId, getStemIdFromChar } from "./stemBranchKey.js";

export type ZokanResolved = {
  zoukanShogen: Stem;
  zoukanChugen: Stem;
  zoukanHongen: Stem;
  activeSlot: "ZOUKAN_SHOGEN" | "ZOUKAN_CHUGEN" | "ZOUKAN_HONGEN";
  activeStem: Stem;
};

export function resolveZokanForBranch(
  branch: Branch,
  displayDepth: number,
  ruleset: RulesetMockV1,
): ZokanResolved {
  const bc = getBranchCharFromId(branch);
  const rule = ruleset.zokanRules[bc];
  if (!rule) {
    throw new SanmeiError(SanmeiErrorCode.RULESET_DATA_MISSING, "蔵干ルールが未定義の支", {
      branchChar: bc,
    });
  }
  const [u0, u1] = rule.upperBounds;
  const s0 = getStemIdFromChar(rule.stems[0]);
  const s1 = getStemIdFromChar(rule.stems[1]);
  const s2 = getStemIdFromChar(rule.stems[2]);
  if (displayDepth <= u0) {
    return {
      zoukanShogen: s0,
      zoukanChugen: s1,
      zoukanHongen: s2,
      activeSlot: "ZOUKAN_SHOGEN",
      activeStem: s0,
    };
  }
  if (displayDepth <= u1) {
    return {
      zoukanShogen: s0,
      zoukanChugen: s1,
      zoukanHongen: s2,
      activeSlot: "ZOUKAN_CHUGEN",
      activeStem: s1,
    };
  }
  return {
    zoukanShogen: s0,
    zoukanChugen: s1,
    zoukanHongen: s2,
    activeSlot: "ZOUKAN_HONGEN",
    activeStem: s2,
  };
}
