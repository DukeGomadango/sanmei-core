import { describe, expect, it } from "vitest";
import rawV1 from "../data/rulesets/mock-v1.json" with { type: "json" };
import { RESEARCH_STAR_LABELS } from "./bundledResearchV1Shared.js";
import {
  buildResearchStarLabelsCatalog,
  collectMatrixStarIdsFromRuleset,
  researchStarLabelFromStarId,
} from "./researchStarLabels.js";

describe("研究 starLabels カタログ", () => {
  it("MA/SU 件数と行列の starId 集合が一致する", () => {
    const catalog = buildResearchStarLabelsCatalog();
    const fromMatrix = collectMatrixStarIdsFromRuleset(
      rawV1 as { mainStars: Record<string, Record<string, string>>; subordinateStars: Record<string, Record<string, string>> },
    );
    expect(fromMatrix.size).toBe(100 + 120);
    for (const id of fromMatrix) {
      expect(catalog[id]).toBeDefined();
    }
    expect(Object.keys(catalog).length).toBe(fromMatrix.size);
  });

  it("共有 RESEARCH_STAR_LABELS がバンドル済みカタログと同一サイズ", () => {
    expect(Object.keys(RESEARCH_STAR_LABELS).length).toBe(220);
  });

  it("golden 相当の starId はアカデミー漢字表の期待ラベルになる", () => {
    expect(researchStarLabelFromStarId("MA_0_6")).toBe("禄存星");
    expect(researchStarLabelFromStarId("MA_0_9")).toBe("調舒星");
    expect(researchStarLabelFromStarId("MA_0_0")).toBe("貫索星");
    expect(researchStarLabelFromStarId("SU_0_4")).toBe("天堂星");
    expect(researchStarLabelFromStarId("SU_0_6")).toBe("天极星");
  });
});
