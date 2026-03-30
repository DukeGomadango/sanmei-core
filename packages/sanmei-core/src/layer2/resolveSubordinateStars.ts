import type { Branch, Stem } from "../layer1/enums.js";
import type { BundledRuleset } from "../schemas/rulesetMockV1.js";
import { SanmeiError, SanmeiErrorCode } from "../errors/sanmeiError.js";
import { getBranchCharFromId, getStemCharFromId } from "./stemBranchKey.js";

export function resolveSubordinateStars(
  dayStem: Stem,
  yearBranch: Branch,
  monthBranch: Branch,
  dayBranch: Branch,
  ruleset: BundledRuleset,
): { yearBranch: string; monthBranch: string; dayBranch: string } {
  const d = getStemCharFromId(dayStem);
  const pick = (b: Branch, label: string) => {
    const bc = getBranchCharFromId(b);
    const row = ruleset.subordinateStars[d];
    const cell = row?.[bc];
    if (cell === undefined) {
      throw new SanmeiError(SanmeiErrorCode.RULESET_DATA_MISSING, "従星表のセル欠損", {
        dayStemChar: d,
        branchChar: bc,
        anchor: label,
      });
    }
    return cell;
  };
  return {
    yearBranch: pick(yearBranch, "YEAR_BRANCH"),
    monthBranch: pick(monthBranch, "MONTH_BRANCH"),
    dayBranch: pick(dayBranch, "DAY_BRANCH"),
  };
}
