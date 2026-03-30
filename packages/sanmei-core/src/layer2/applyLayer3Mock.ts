import type { BundledRuleset } from "../schemas/rulesetMockV1.js";
import type { InteractionRulesLayer2 } from "../schemas/layer2.js";

/**
 * Layer3a スタブ: 位相法・虚気は監修前プレースホルダ。ruleset で将来差し替え。
 */
export function applyLayer3aMock(
  interactionRules: InteractionRulesLayer2,
  _ruleset: BundledRuleset,
): InteractionRulesLayer2 {
  return {
    ...interactionRules,
    isouhou: [],
    kyoki: null,
  };
}
