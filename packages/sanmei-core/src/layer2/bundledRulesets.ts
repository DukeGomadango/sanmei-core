import { BundledRulesetSchema, type BundledRuleset, BUNDLED_RULESET_VERSIONS } from "../schemas/rulesetMockV1.js";
import rawV1 from "../data/rulesets/mock-v1.json" with { type: "json" };
import rawInternalV2 from "../data/rulesets/mock-internal-v2.json" with { type: "json" };
import { RESEARCH_DAIUN_BLOCK, RESEARCH_INTERACTION_BLOCK } from "./bundledResearchV1Shared.js";

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
    researchDaiun: RESEARCH_DAIUN_BLOCK,
    interaction: RESEARCH_INTERACTION_BLOCK,
  }),
  "research-experimental-v1": BundledRulesetSchema.parse({
    ...rawV1,
    meta: {
      ...rawV1.meta,
      rulesetVersion: "research-experimental-v1",
      description:
        "Research sect experimental: baseline + extended isouhou kinds (L2_SECONDARY). Parallel to research-v1.",
    },
    researchDaiun: RESEARCH_DAIUN_BLOCK,
    interaction: {
      ...RESEARCH_INTERACTION_BLOCK,
      priorityVersion: "research-experimental-v1-l3a-priority-r1",
      isouhouExtended: {
        enabledKinds: ["KANGO", "NACHION", "RITSUON", "TENKOKUCHICHU", "DAIHANKAI"],
        priorityOrder: ["TENKOKUCHICHU", "DAIHANKAI", "RITSUON", "NACHION", "KANGO"],
        scopePolicy: "NATAL_AND_TIMELINE",
        conflictPolicy: {
          baseKindsFirst: true,
        },
        sourceLevel: "L2_SECONDARY",
        priorityVersion: "research-exp-isouhou-extended-v1",
      },
      locatorPriority: [
        { kind: "TENKOKUCHICHU", tier: "P0", owner: "research-sect" },
        { kind: "DAIHANKAI", tier: "P0", owner: "research-sect" },
        { kind: "KANGO", tier: "P1", owner: "research-sect" },
        { kind: "NACHION", tier: "P1", owner: "research-sect" },
        { kind: "RITSUON", tier: "P1", owner: "research-sect" },
      ],
      kaku: {
        ...RESEARCH_INTERACTION_BLOCK.kaku!,
        candidateRules: [
          ...RESEARCH_INTERACTION_BLOCK.kaku!.candidateRules,
          {
            id: "KAKU_TENKOKUCHICHU",
            label: "天剋地冲格（研究・拡張）",
            priority: 12,
            tags: ["GOHOU"],
            requiresIsouhouKindsAny: ["TENKOKUCHICHU"],
          },
        ],
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
