import type { BundledRuleset } from "../schemas/rulesetMockV1.js";
import type { InteractionRulesLayer2 } from "../schemas/layer2.js";

type Layer3bContext = {
  allowGohouInKaku?: boolean;
};

type Candidate = {
  id: string;
  label: string;
  priority: number;
  reasons: string[];
  tags: string[];
};

function applyLayer3bNoop(
  interactionRules: InteractionRulesLayer2,
  _ruleset: BundledRuleset,
  _context: Layer3bContext,
): InteractionRulesLayer2 {
  return interactionRules;
}

function applyLayer3bResearch(
  interactionRules: InteractionRulesLayer2,
  ruleset: BundledRuleset,
  context: Layer3bContext,
): InteractionRulesLayer2 {
  const kakuRuleset = ruleset.interaction?.kaku;
  if (!kakuRuleset) return interactionRules;

  const matchedKinds = new Set((interactionRules.isouhou ?? []).map((x) => x.kind));
  const hasKyokiShadow = interactionRules.kyoki?.shadowYousen !== undefined;

  const candidates: Candidate[] = kakuRuleset.candidateRules
    .filter((rule) => {
      if (rule.requiresKyokiShadow === true && !hasKyokiShadow) return false;
      if (rule.requiresIsouhouKindsAny && !rule.requiresIsouhouKindsAny.some((k) => matchedKinds.has(k))) return false;
      return true;
    })
    .map((rule) => ({
      id: rule.id,
      label: rule.label,
      priority: rule.priority,
      reasons: [
        ...(rule.requiresIsouhouKindsAny?.length ? [`isouhou:${rule.requiresIsouhouKindsAny.join("|")}`] : []),
        ...(rule.requiresKyokiShadow ? ["kyoki:shadow"] : []),
      ],
      tags: rule.tags ?? [],
    }))
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));

  const allowGohouInKakuApplied = context.allowGohouInKaku === true;
  const suppressed: { id: string; reasonCode: string }[] = [];
  let resolved = candidates;

  if (!allowGohouInKakuApplied) {
    const blockedTags = new Set(kakuRuleset.allowGohouInKakuPolicy.whenFalseSuppressTags);
    resolved = candidates.filter((c) => {
      const blocked = c.tags.some((tag) => blockedTags.has(tag));
      if (blocked) suppressed.push({ id: c.id, reasonCode: "ALLOW_GOHOU_DISABLED" });
      return !blocked;
    });
  }

  if (kakuRuleset.selectionPolicy.resolveMode === "SINGLE") {
    const first = resolved[0];
    resolved = first ? [first] : [];
    candidates.forEach((c) => {
      if (!resolved.find((r) => r.id === c.id) && !suppressed.find((s) => s.id === c.id)) {
        suppressed.push({ id: c.id, reasonCode: "LOWER_PRIORITY" });
      }
    });
  } else if (kakuRuleset.selectionPolicy.maxResolved) {
    const keep = resolved.slice(0, kakuRuleset.selectionPolicy.maxResolved);
    resolved.slice(kakuRuleset.selectionPolicy.maxResolved).forEach((c) => {
      suppressed.push({ id: c.id, reasonCode: "MAX_RESOLVED_LIMIT" });
    });
    resolved = keep;
  }

  return {
    ...interactionRules,
    kaku: {
      candidates: candidates.map(({ tags: _tags, ...rest }) => rest),
      resolved: resolved.map(({ tags: _tags, ...rest }) => rest),
      suppressed,
      meta: {
        ruleSetId: ruleset.meta.rulesetVersion,
        priorityVersion: ruleset.interaction?.priorityVersion ?? "default-v1",
        sourceLevel: ruleset.interaction?.sourceLevel ?? "L2_SECONDARY",
        allowGohouInKakuApplied,
        evaluateShadowProfileApplied: kakuRuleset.evaluateShadowProfile,
      },
    },
  };
}

const resolverByRulesetVersion = {
  "research-v1": applyLayer3bResearch,
  "research-experimental-v1": applyLayer3bResearch,
} as const;

export function applyLayer3bByRuleset(
  interactionRules: InteractionRulesLayer2,
  ruleset: BundledRuleset,
  context: Layer3bContext,
): InteractionRulesLayer2 {
  const resolver = resolverByRulesetVersion[ruleset.meta.rulesetVersion as keyof typeof resolverByRulesetVersion];
  if (!resolver) return applyLayer3bNoop(interactionRules, ruleset, context);
  return resolver(interactionRules, ruleset, context);
}
