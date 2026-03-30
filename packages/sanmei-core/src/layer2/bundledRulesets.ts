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
    interaction: {
      enabledKinds: ["SHIGO", "HOSANUI", "HANKAI", "SANGOU", "TAICHU", "GAI", "KEI", "HA"],
      patterns: [
        { kind: "SHIGO", branches: [0, 1] },
        { kind: "SHIGO", branches: [11, 2] },
        { kind: "SHIGO", branches: [10, 3] },
        { kind: "SHIGO", branches: [9, 4] },
        { kind: "SHIGO", branches: [8, 5] },
        { kind: "SHIGO", branches: [7, 6] },
        { kind: "HOSANUI", branches: [11, 0, 1] },
        { kind: "HOSANUI", branches: [2, 3, 4] },
        { kind: "HOSANUI", branches: [5, 6, 7] },
        { kind: "HOSANUI", branches: [8, 9, 10] },
        { kind: "HANKAI", branches: [8, 0] },
        { kind: "HANKAI", branches: [0, 4] },
        { kind: "HANKAI", branches: [8, 4] },
        { kind: "HANKAI", branches: [11, 3] },
        { kind: "HANKAI", branches: [3, 7] },
        { kind: "HANKAI", branches: [11, 7] },
        { kind: "HANKAI", branches: [2, 6] },
        { kind: "HANKAI", branches: [6, 10] },
        { kind: "HANKAI", branches: [2, 10] },
        { kind: "HANKAI", branches: [5, 9] },
        { kind: "HANKAI", branches: [9, 1] },
        { kind: "HANKAI", branches: [5, 1] },
        { kind: "SANGOU", branches: [8, 0, 4] },
        { kind: "SANGOU", branches: [11, 3, 7] },
        { kind: "SANGOU", branches: [2, 6, 10] },
        { kind: "SANGOU", branches: [5, 9, 1] },
        { kind: "TAICHU", branches: [0, 6] },
        { kind: "TAICHU", branches: [1, 7] },
        { kind: "TAICHU", branches: [2, 8] },
        { kind: "TAICHU", branches: [3, 9] },
        { kind: "TAICHU", branches: [4, 10] },
        { kind: "TAICHU", branches: [5, 11] },
        { kind: "GAI", branches: [0, 7] },
        { kind: "GAI", branches: [1, 6] },
        { kind: "GAI", branches: [2, 5] },
        { kind: "GAI", branches: [3, 4] },
        { kind: "GAI", branches: [8, 11] },
        { kind: "GAI", branches: [9, 10] },
        { kind: "KEI", branches: [0, 3] },
        { kind: "KEI", branches: [2, 5] },
        { kind: "KEI", branches: [5, 8] },
        { kind: "KEI", branches: [8, 2] },
        { kind: "KEI", branches: [1, 7] },
        { kind: "KEI", branches: [7, 10] },
        { kind: "KEI", branches: [10, 1] },
        { kind: "KEI", branches: [4, 4] },
        { kind: "KEI", branches: [6, 6] },
        { kind: "KEI", branches: [9, 9] },
        { kind: "KEI", branches: [11, 11] },
        { kind: "HA", branches: [0, 9] },
        { kind: "HA", branches: [6, 3] },
        { kind: "HA", branches: [1, 4] },
        { kind: "HA", branches: [7, 10] },
      ],
      priorityOrder: ["SANGOU", "HANKAI", "HOSANUI", "SHIGO", "TAICHU", "KEI", "GAI", "HA"],
      priorityVersion: "research-v1-l3a-priority-r1",
      sourceLevel: "L2_SECONDARY",
      kyoki: {
        featureEnabled: false,
      },
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
