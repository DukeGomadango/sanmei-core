import type { Branch, Stem } from "../layer1/enums.js";
import type { RulesetMockV1 } from "../schemas/rulesetMockV1.js";
import { SanmeiError, SanmeiErrorCode } from "../errors/sanmeiError.js";
import { getBranchCharFromId, getStemCharFromId } from "./stemBranchKey.js";
import { elementsFromRulesetStrings } from "./elementCodes.js";

export function resolveGuardianKishin(
  dayStem: Stem,
  monthBranch: Branch,
  ruleset: RulesetMockV1,
): { guardianDeities: ReturnType<typeof elementsFromRulesetStrings>; kishin: ReturnType<typeof elementsFromRulesetStrings> } {
  const ds = getStemCharFromId(dayStem);
  const mb = getBranchCharFromId(monthBranch);
  const gRow = ruleset.guardianByDayStemMonthBranch[ds];
  const kRow = ruleset.kishinByDayStemMonthBranch[ds];
  const gCell = gRow?.[mb];
  const kCell = kRow?.[mb];
  if (gCell === undefined || kCell === undefined) {
    throw new SanmeiError(SanmeiErrorCode.RULESET_DATA_MISSING, "守護神／忌神表のセル欠損", {
      dayStemChar: ds,
      monthBranchChar: mb,
    });
  }
  return {
    guardianDeities: elementsFromRulesetStrings(gCell),
    kishin: elementsFromRulesetStrings(kCell),
  };
}
