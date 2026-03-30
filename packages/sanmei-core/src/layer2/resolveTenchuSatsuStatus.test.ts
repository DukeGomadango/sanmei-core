import { describe, expect, it } from "vitest";
import { resolveTenchuSatsuStatusB2 } from "./resolveTenchuSatsuStatus.js";
import type { TenchuRulesB2 } from "../schemas/rulesetMockV1.js";

const b2Base: TenchuRulesB2 = {
  dslVersion: "research-tenchu-b2-v1",
  sourceLevel: "L2_SECONDARY",
  annual: { activeWhenSexagenaryIndexIn: [] },
  daiun: { activeWhenCurrentPhaseSexagenaryIndexIn: [] },
};

function timelineFixture() {
  return {
    annual: { calendarYear: 2026, sexagenaryIndex: 41, relatedStarId: "x" },
    daiun: {
      startAge: 1,
      phases: [{ phaseIndex: 0, sexagenaryIndex: 19, spanYears: 10 }],
      currentPhase: { phaseIndex: 1, sexagenaryIndex: 20, spanYears: 10 },
    },
  };
}

describe("resolveTenchuSatsuStatusB2", () => {
  it("空集合では動的フラグは false", () => {
    const d = resolveTenchuSatsuStatusB2(b2Base, timelineFixture());
    expect(d.annualTenchuWindowActive).toBe(false);
    expect(d.daiunPhaseTenchuWindowActive).toBe(false);
    expect(d.annualSexagenaryIndex).toBe(41);
    expect(d.daiunCurrentPhaseSexagenaryIndex).toBe(20);
  });

  it("集合に含まれる index では true", () => {
    const rules: TenchuRulesB2 = {
      ...b2Base,
      annual: { activeWhenSexagenaryIndexIn: [41] },
      daiun: { activeWhenCurrentPhaseSexagenaryIndexIn: [20] },
    };
    const d = resolveTenchuSatsuStatusB2(rules, timelineFixture());
    expect(d.annualTenchuWindowActive).toBe(true);
    expect(d.daiunPhaseTenchuWindowActive).toBe(true);
  });
});
