import { describe, expect, it } from "vitest";
import { bundledMockRulesetV1 } from "./bundledMockRuleset.js";
import { resolveEnergyData } from "./resolveEnergyData.js";
import { resolveDestinyBugs } from "./resolveDestinyBugs.js";
import type { InsenLayer2 } from "../schemas/layer2.js";
import { CalculateResultSchema } from "../schemas/layer2.js";
import { areaRatioPermilleFromVertexTenths, vertexAnglesDegTenthsForPillars } from "./l2cGeometry.js";

const goldenInsen: InsenLayer2 = {
  year: {
    stem: 6,
    branch: 4,
    zokan: {
      zoukanShogen: 4,
      zoukanChugen: 7,
      zoukanHongen: 0,
      activeSlot: "ZOUKAN_CHUGEN",
      activeStem: 7,
    },
  },
  month: {
    stem: 8,
    branch: 6,
    zokan: {
      zoukanShogen: 6,
      zoukanChugen: 9,
      zoukanHongen: 2,
      activeSlot: "ZOUKAN_CHUGEN",
      activeStem: 9,
    },
  },
  day: {
    stem: 0,
    branch: 4,
    zokan: {
      zoukanShogen: 4,
      zoukanChugen: 7,
      zoukanHongen: 0,
      activeSlot: "ZOUKAN_CHUGEN",
      activeStem: 7,
    },
  },
  displayDepth: 11,
  rawDelta: 10,
};

describe("L2c geometry", () => {
  it("golden の頂点角度・千分率", () => {
    const v = vertexAnglesDegTenthsForPillars(goldenInsen.year, goldenInsen.month, goldenInsen.day);
    expect(v).toEqual([960, 1080, 2400]);
    expect(areaRatioPermilleFromVertexTenths(v)).toBe(140);
  });
});

describe("resolveEnergyData", () => {
  it("golden_insen と mock ruleset で決定論的な値", () => {
    const e = resolveEnergyData(goldenInsen, bundledMockRulesetV1);
    expect(e).toEqual({
      totalEnergy: 23,
      energyByElement: {
        WOOD: 10,
        FIRE: 0,
        EARTH: 0,
        METAL: 10,
        WATER: 3,
      },
      actionAreaSize: 3,
      actionAreaGeometry: {
        vertexAnglesDegTenths: [960, 1080, 2400],
        areaRatioPermille: 140,
      },
    });
    const sumByElement =
      e.energyByElement.WOOD +
      e.energyByElement.FIRE +
      e.energyByElement.EARTH +
      e.energyByElement.METAL +
      e.energyByElement.WATER;
    expect(sumByElement).toBe(e.totalEnergy);
  });
});

describe("resolveDestinyBugs", () => {
  it("日柱が abnormalKanshiNormal に含まれると IJOU_KANSHI_NORMAL", () => {
    const ruleset = {
      ...bundledMockRulesetV1,
      destinyBugRules: {
        ...bundledMockRulesetV1.destinyBugRules,
        abnormalKanshiNormal: ["甲辰"],
      },
    };
    expect(resolveDestinyBugs(goldenInsen, ruleset)).toEqual(["IJOU_KANSHI_NORMAL"]);
  });

  it("デフォルト mock では空", () => {
    expect(resolveDestinyBugs(goldenInsen, bundledMockRulesetV1)).toEqual([]);
  });
});

describe("CalculateResult Zod", () => {
  it("destinyBugs の重複は parse 時にユニーク化", () => {
    const parsed = CalculateResultSchema.parse({
      meta: {
        engineVersion: "0.0.0",
        rulesetVersion: "mock-v1",
        sect: "takao",
        calculatedAt: "1970-01-01T00:00:00.000Z",
      },
      baseProfile: {
        insen: goldenInsen,
        yousen: {
          mainStars: [
            { part: "HEAD", starId: "x" },
            { part: "CHEST", starId: "x" },
            { part: "BELLY", starId: "x" },
            { part: "RIGHT_HAND", starId: "x" },
            { part: "LEFT_HAND", starId: "x" },
          ],
          subordinateStars: [
            { anchor: "YEAR_BRANCH", starId: "x" },
            { anchor: "MONTH_BRANCH", starId: "x" },
            { anchor: "DAY_BRANCH", starId: "x" },
          ],
        },
        familyNodes: [],
        energyData: {
          totalEnergy: 0,
          energyByElement: { WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0 },
          actionAreaSize: 1,
          actionAreaGeometry: { vertexAnglesDegTenths: [0, 0, 0], areaRatioPermille: 0 },
        },
        destinyBugs: [
          "IJOU_KANSHI_NORMAL",
          "IJOU_KANSHI_NORMAL",
          "SHUKUMEI_TENCHUSATSU_YEAR",
        ],
      },
      dynamicTimeline: {
        daiun: {
          startAge: 0,
          phases: [{ phaseIndex: 0, sexagenaryIndex: 0, spanYears: 10 }],
          currentPhase: { phaseIndex: 0, sexagenaryIndex: 0, spanYears: 10 },
        },
        annual: { calendarYear: 2000, sexagenaryIndex: 0, relatedStarId: "x" },
      },
      interactionRules: { guardianDeities: [], kishin: [], isouhou: [], kyoki: null },
    });
    expect(parsed.baseProfile.destinyBugs).toEqual([
      "IJOU_KANSHI_NORMAL",
      "SHUKUMEI_TENCHUSATSU_YEAR",
    ]);
  });
});
