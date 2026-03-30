import { describe, expect, it } from "vitest";
import { getBundledRuleset } from "./bundledRulesets.js";
import { applyLayer3aByRuleset, applyLayer3aMock, resolveResearchTimelinePairInteractions } from "./applyLayer3Mock.js";
import type { InsenLayer2, InteractionRulesLayer2 } from "../schemas/layer2.js";

const baseInteraction: InteractionRulesLayer2 = {
  guardianDeities: [],
  kishin: [],
  isouhou: [],
  kyoki: null,
};

function buildInsen(yearBranch: number, monthBranch: number, dayBranch: number): InsenLayer2 {
  return {
    year: {
      stem: 0,
      branch: yearBranch,
      zokan: { zoukanShogen: 0, zoukanChugen: 1, zoukanHongen: 2, activeSlot: "ZOUKAN_SHOGEN", activeStem: 0 },
    },
    month: {
      stem: 1,
      branch: monthBranch,
      zokan: { zoukanShogen: 0, zoukanChugen: 1, zoukanHongen: 2, activeSlot: "ZOUKAN_SHOGEN", activeStem: 0 },
    },
    day: {
      stem: 2,
      branch: dayBranch,
      zokan: { zoukanShogen: 0, zoukanChugen: 1, zoukanHongen: 2, activeSlot: "ZOUKAN_SHOGEN", activeStem: 0 },
    },
    displayDepth: 1,
    rawDelta: 1,
  };
}

describe("applyLayer3aByRuleset", () => {
  it("research-v1 では成立した位相法を優先度ソートで全件保持する", () => {
    const ruleset = getBundledRuleset("research-v1");
    const result = applyLayer3aByRuleset(baseInteraction, ruleset, {
      insen: buildInsen(8, 0, 4), // 申・子・辰
    });
    expect(result.isouhou.length).toBeGreaterThanOrEqual(4);
    expect(result.isouhou[0]?.kind).toBe("SANGOU");
    const hankaiCount = result.isouhou.filter((v) => v.kind === "HANKAI").length;
    expect(hankaiCount).toBe(3);
    expect(result.resolutionMeta?.ruleSetId).toBe("research-v1");
  });

  it("HANKAI の hasCentralBranch を正しく付与する", () => {
    const ruleset = getBundledRuleset("research-v1");
    const central = applyLayer3aByRuleset(baseInteraction, ruleset, {
      insen: buildInsen(8, 0, 2), // 申-子（旺支あり）
    });
    const nonCentral = applyLayer3aByRuleset(baseInteraction, ruleset, {
      insen: buildInsen(8, 4, 2), // 申-辰（旺支なし）
    });

    const centralHankai = central.isouhou.find((v) => v.kind === "HANKAI" && v.involved?.includes("子"));
    const nonCentralHankai = nonCentral.isouhou.find((v) => v.kind === "HANKAI");
    expect(centralHankai?.hasCentralBranch).toBe(true);
    expect(nonCentralHankai?.hasCentralBranch).toBe(false);
  });

  it("research以外は noop resolver で後方互換を維持する", () => {
    const ruleset = getBundledRuleset("mock-v1");
    const result = applyLayer3aByRuleset(baseInteraction, ruleset, {
      insen: buildInsen(8, 0, 4),
    });
    expect(result).toEqual(applyLayer3aMock(baseInteraction, ruleset));
  });
});

describe("resolveResearchTimelinePairInteractions", () => {
  it("research-v1 で targetPillar 付きエントリを返す", () => {
    const ruleset = getBundledRuleset("research-v1");
    const entries = resolveResearchTimelinePairInteractions(8, 0, "DAY", 2, ruleset);
    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((entry) => {
      expect(entry.targetPillar).toBe("DAY");
      expect(entry.fortuneType).toBe("DAIUN");
      expect(entry.phaseIndex).toBe(2);
    });
  });
});
