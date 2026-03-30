import { Branch, type Branch as BranchType } from "../layer1/enums.js";
import { branchLabel } from "../layer1/stemBranchTables.js";
import type { BundledRuleset } from "../schemas/rulesetMockV1.js";
import type { DynamicTimeline, InsenLayer2, InteractionRulesLayer2, IsouhouEntry } from "../schemas/layer2.js";

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

type FortuneBranches = {
  daiun?: number;
  annual?: number;
  monthly?: number;
};

type Layer3aContext = {
  insen: InsenLayer2;
  dynamicTimeline?: DynamicTimeline;
  fortuneBranches?: FortuneBranches;
};

type Layer3aResolver = (
  interactionRules: InteractionRulesLayer2,
  ruleset: BundledRuleset,
  context: Layer3aContext,
) => InteractionRulesLayer2;

function isCentralBranch(branch: BranchType): boolean {
  return (
    branch === Branch.ZI ||
    branch === Branch.MAO ||
    branch === Branch.WU ||
    branch === Branch.YOU
  );
}

function includesPattern(counts: number[], pattern: number[]): boolean {
  if (pattern.length === 2) {
    const [a, b] = pattern;
    if (a === b) return counts[a] >= 2;
    return counts[a] >= 1 && counts[b] >= 1;
  }
  return pattern.every((b) => counts[b] >= 1);
}

function resolveResearchIsouhou(insen: InsenLayer2, ruleset: BundledRuleset): IsouhouEntry[] {
  const interaction = ruleset.interaction;
  if (!interaction) return [];

  const counts = Array.from({ length: 12 }, () => 0);
  const natalBranches = [insen.year.branch, insen.month.branch, insen.day.branch];
  natalBranches.forEach((b) => {
    counts[b] += 1;
  });

  const enabled = new Set(interaction.enabledKinds);
  const candidates = interaction.patterns
    .filter((pattern) => enabled.has(pattern.kind))
    .filter((pattern) => includesPattern(counts, pattern.branches))
    .map((pattern) => {
      const branches = pattern.branches as BranchType[];
      return {
        kind: pattern.kind,
        involved: branches.map((b) => branchLabel(b)),
        scope: "NATAL_3",
        ...(pattern.kind === "HANKAI"
          ? { hasCentralBranch: branches.some((b) => isCentralBranch(b)) }
          : {}),
      } satisfies IsouhouEntry;
    });

  const priorityIndex = new Map(interaction.priorityOrder.map((kind, idx) => [kind, idx]));
  return candidates.sort((a, b) => {
    const pa = priorityIndex.get(a.kind) ?? 999;
    const pb = priorityIndex.get(b.kind) ?? 999;
    if (pa !== pb) return pa - pb;
    return (a.involved ?? []).join("-").localeCompare((b.involved ?? []).join("-"), "ja");
  });
}

function applyLayer3aResearch(
  interactionRules: InteractionRulesLayer2,
  ruleset: BundledRuleset,
  context: Layer3aContext,
): InteractionRulesLayer2 {
  const interaction = ruleset.interaction;
  const kyokiEnabled = interaction?.kyoki.featureEnabled === true;
  return {
    ...interactionRules,
    isouhou: resolveResearchIsouhou(context.insen, ruleset),
    kyoki: kyokiEnabled ? { shadowYousen: undefined } : null,
    resolutionMeta: {
      ruleSetId: ruleset.meta.rulesetVersion,
      priorityVersion: interaction?.priorityVersion ?? "default-v1",
      sourceLevel: interaction?.sourceLevel ?? "L2_SECONDARY",
    },
  };
}

const resolverByRulesetVersion: Record<string, Layer3aResolver> = {
  "research-v1": applyLayer3aResearch,
};

export function applyLayer3aByRuleset(
  interactionRules: InteractionRulesLayer2,
  ruleset: BundledRuleset,
  context: Layer3aContext,
): InteractionRulesLayer2 {
  const resolver = resolverByRulesetVersion[ruleset.meta.rulesetVersion] ?? applyLayer3aMock;
  return resolver(interactionRules, ruleset, context);
}
