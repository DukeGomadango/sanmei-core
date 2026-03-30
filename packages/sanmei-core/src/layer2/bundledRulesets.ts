import { BundledRulesetSchema, type BundledRuleset, BUNDLED_RULESET_VERSIONS } from "../schemas/rulesetMockV1.js";
import rawV1 from "../data/rulesets/mock-v1.json" with { type: "json" };
import rawInternalV2 from "../data/rulesets/mock-internal-v2.json" with { type: "json" };

const cache: Record<string, BundledRuleset> = {
  "mock-v1": BundledRulesetSchema.parse(rawV1),
  "mock-internal-v2": BundledRulesetSchema.parse(rawInternalV2),
  "research-v1": BundledRulesetSchema.parse({
    ...rawV1,
    meta: {
      ...rawV1.meta,
      rulesetVersion: "research-v1",
      description: "Research sect baseline bundle (M1 contract-ready; logic mirrors mock-v1).",
    },
  }),
};

export { BUNDLED_RULESET_VERSIONS };

export function isBundledRulesetVersion(v: string): boolean {
  return (BUNDLED_RULESET_VERSIONS as readonly string[]).includes(v);
}

export function getBundledRuleset(version: string): BundledRuleset {
  const parsed = cache[version];
  if (!parsed) throw new Error(`getBundledRuleset: no bundled data for ${version}`);
  return parsed;
}
