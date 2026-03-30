import type { Pillar } from "../layer1/pillars.js";
import type { Stem } from "../layer1/enums.js";
import type { RulesetMockV1 } from "../schemas/rulesetMockV1.js";
import type { ZokanResolved } from "./resolveZokan.js";
import { SanmeiError, SanmeiErrorCode } from "../errors/sanmeiError.js";
import { getStemCharFromId } from "./stemBranchKey.js";
import type { MainStarPosition } from "../schemas/layer2.js";

type PillarZ = Pillar & { zokan: ZokanResolved };

export function resolveMainStars(
  dayStem: Stem,
  pillars: { year: PillarZ; month: PillarZ; day: PillarZ },
  ruleset: RulesetMockV1,
): MainStarPosition[] {
  const dayChar = getStemCharFromId(dayStem);
  const row = ruleset.mainStars[dayChar];
  if (!row) {
    throw new SanmeiError(SanmeiErrorCode.RULESET_DATA_MISSING, "主星表に日干行がない", { dayStemChar: dayChar });
  }
  const pick = (targetStem: Stem, part: MainStarPosition["part"]): MainStarPosition => {
    const tc = getStemCharFromId(targetStem);
    const starId = row[tc];
    if (starId === undefined) {
      throw new SanmeiError(SanmeiErrorCode.RULESET_DATA_MISSING, "主星表のセル欠損", {
        dayStemChar: dayChar,
        targetStemChar: tc,
        part,
      });
    }
    return { part, starId };
  };
  return [
    pick(pillars.year.stem, "HEAD"),
    pick(pillars.month.zokan.activeStem, "CHEST"),
    pick(pillars.day.zokan.activeStem, "BELLY"),
    pick(pillars.month.stem, "RIGHT_HAND"),
    pick(pillars.year.zokan.activeStem, "LEFT_HAND"),
  ];
}
