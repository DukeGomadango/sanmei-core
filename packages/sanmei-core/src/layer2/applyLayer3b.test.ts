import { describe, expect, it } from "vitest";
import { getBundledRuleset } from "./bundledRulesets.js";
import { applyLayer3bByRuleset } from "./applyLayer3b.js";
import type { InteractionRulesLayer2 } from "../schemas/layer2.js";

const baseInteraction = (kinds: string[]): InteractionRulesLayer2 => ({
  guardianDeities: [],
  kishin: [],
  isouhou: kinds.map((kind) => ({ kind })),
  kyoki: null,
});

describe("applyLayer3bByRuleset", () => {
  it("allowGohouInKaku=false では GOHOU タグ候補を suppressed へ送る", () => {
    const ruleset = getBundledRuleset("research-v1");
    const result = applyLayer3bByRuleset(baseInteraction(["SANGOU", "KEI"]), ruleset, {
      allowGohouInKaku: false,
    });
    expect(result.kaku?.candidates.map((x) => x.id)).toEqual(["KAKU_SANGOU", "KAKU_KEI"]);
    expect(result.kaku?.resolved.map((x) => x.id)).toEqual(["KAKU_KEI"]);
    expect(result.kaku?.suppressed).toEqual([{ id: "KAKU_SANGOU", reasonCode: "ALLOW_GOHOU_DISABLED" }]);
  });

  it("allowGohouInKaku=true なら GOHOU 候補も resolved に残す", () => {
    const ruleset = getBundledRuleset("research-v1");
    const result = applyLayer3bByRuleset(baseInteraction(["SANGOU", "KEI"]), ruleset, {
      allowGohouInKaku: true,
    });
    expect(result.kaku?.resolved.map((x) => x.id)).toEqual(["KAKU_SANGOU", "KAKU_KEI"]);
    expect(result.kaku?.suppressed).toEqual([]);
  });
});
