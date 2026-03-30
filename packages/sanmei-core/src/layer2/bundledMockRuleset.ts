import { RulesetMockV1Schema, type RulesetMockV1 } from "../schemas/rulesetMockV1.js";
import raw from "../data/rulesets/mock-v1.json" with { type: "json" };

export const bundledMockRulesetV1: RulesetMockV1 = RulesetMockV1Schema.parse(raw);
