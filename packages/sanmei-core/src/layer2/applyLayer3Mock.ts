import { Branch, type Branch as BranchType, type Stem } from "../layer1/enums.js";
import { branchLabel, stemLabel } from "../layer1/stemBranchTables.js";
import {
  areBranchesChong,
  areKangoPair,
  areStemsTenkokuPair,
} from "../layer1/stemPairInteractions.js";
import type { BundledRuleset } from "../schemas/rulesetMockV1.js";
import type {
  DynamicTimeline,
  InsenLayer2,
  InteractionRulesLayer2,
  IsouhouEntry,
  TimelineInteractionEntry,
} from "../schemas/layer2.js";

const EXTENDED_ISOUHOU_KINDS = new Set([
  "KANGO",
  "NACHION",
  "RITSUON",
  "TENKOKUCHICHU",
  "DAIHANKAI",
]);

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

function includesPairPattern(a: number, b: number, pattern: number[]): boolean {
  if (pattern.length !== 2) return false;
  const [p0, p1] = pattern;
  if (p0 === p1) return a === p0 && b === p0;
  return (a === p0 && b === p1) || (a === p1 && b === p0);
}

export function resolveResearchIsouhou(insen: InsenLayer2, ruleset: BundledRuleset): IsouhouEntry[] {
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

  const priorityIndex = new Map<string, number>(interaction.priorityOrder.map((kind, idx) => [kind, idx]));
  return candidates.sort((a, b) => {
    const pa = priorityIndex.get(a.kind) ?? 999;
    const pb = priorityIndex.get(b.kind) ?? 999;
    if (pa !== pb) return pa - pb;
    return (a.involved ?? []).join("-").localeCompare((b.involved ?? []).join("-"), "ja");
  });
}

function collectHankaiPairPatterns(ruleset: BundledRuleset): number[][] {
  const interaction = ruleset.interaction;
  if (!interaction) return [];
  return interaction.patterns
    .filter((p) => p.kind === "HANKAI" && p.branches.length === 2)
    .map((p) => [...p.branches]);
}

type PillarNatal = { key: "YEAR" | "MONTH" | "DAY"; stem: Stem; branch: BranchType };

function resolveExperimentalIsouhouNatal(insen: InsenLayer2, ruleset: BundledRuleset): IsouhouEntry[] {
  const interaction = ruleset.interaction;
  const ext = interaction?.isouhouExtended;
  if (!ext) return [];

  const enabled = new Set(ext.enabledKinds);
  const hankaiPairs = collectHankaiPairPatterns(ruleset);

  const pillars: PillarNatal[] = [
    { key: "YEAR", stem: insen.year.stem as Stem, branch: insen.year.branch as BranchType },
    { key: "MONTH", stem: insen.month.stem as Stem, branch: insen.month.branch as BranchType },
    { key: "DAY", stem: insen.day.stem as Stem, branch: insen.day.branch as BranchType },
  ];

  const pairIndices: Array<[number, number]> = [
    [0, 1],
    [0, 2],
    [1, 2],
  ];

  const out: IsouhouEntry[] = [];
  const seen = new Set<string>();

  const push = (entry: IsouhouEntry) => {
    const key = `${entry.kind}:${(entry.involved ?? []).join(",")}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(entry);
  };

  for (const [i, j] of pairIndices) {
    const a = pillars[i]!;
    const b = pillars[j]!;
    const pairLabel = `${a.key}-${b.key}`;

    if (enabled.has("KANGO") && areKangoPair(a.stem, b.stem)) {
      push({
        kind: "KANGO",
        involved: [stemLabel(a.stem), stemLabel(b.stem), pairLabel],
        scope: "NATAL_3",
      });
    }

    if (enabled.has("NACHION") && a.stem === b.stem && areBranchesChong(a.branch, b.branch)) {
      push({
        kind: "NACHION",
        involved: [branchLabel(a.branch), branchLabel(b.branch), pairLabel],
        scope: "NATAL_3",
      });
    }

    if (enabled.has("RITSUON") && a.stem === b.stem && a.branch === b.branch) {
      push({
        kind: "RITSUON",
        involved: [stemLabel(a.stem), branchLabel(a.branch), pairLabel],
        scope: "NATAL_3",
      });
    }

    if (
      enabled.has("TENKOKUCHICHU") &&
      areStemsTenkokuPair(a.stem, b.stem) &&
      areBranchesChong(a.branch, b.branch)
    ) {
      push({
        kind: "TENKOKUCHICHU",
        involved: [stemLabel(a.stem), stemLabel(b.stem), branchLabel(a.branch), branchLabel(b.branch), pairLabel],
        scope: "NATAL_3",
      });
    }

    if (enabled.has("DAIHANKAI") && a.stem === b.stem) {
      const matchHankai = hankaiPairs.some((br) => includesPairPattern(a.branch, b.branch, br));
      if (matchHankai) {
        push({
          kind: "DAIHANKAI",
          involved: [stemLabel(a.stem), branchLabel(a.branch), branchLabel(b.branch), pairLabel],
          scope: "NATAL_3",
        });
      }
    }
  }

  return out;
}

function mergeBaseAndExtendedIsouhou(
  base: IsouhouEntry[],
  extended: IsouhouEntry[],
  ruleset: BundledRuleset,
): IsouhouEntry[] {
  const interaction = ruleset.interaction;
  if (!interaction) return base;

  const extCfg = interaction.isouhouExtended;
  const baseFirst = extCfg?.conflictPolicy?.baseKindsFirst !== false;

  const basePriority = new Map<string, number>(interaction.priorityOrder.map((k, idx) => [k, idx]));
  const extPriority = new Map<string, number>((extCfg?.priorityOrder ?? []).map((k, idx) => [k, idx]));

  const merged = [...base, ...extended];

  return merged.sort((a, b) => {
    const aExt = EXTENDED_ISOUHOU_KINDS.has(a.kind);
    const bExt = EXTENDED_ISOUHOU_KINDS.has(b.kind);

    if (baseFirst && aExt !== bExt) {
      return aExt ? 1 : -1;
    }
    if (!baseFirst && aExt !== bExt) {
      return aExt ? -1 : 1;
    }

    const prio = (e: IsouhouEntry) => {
      if (EXTENDED_ISOUHOU_KINDS.has(e.kind)) {
        return extPriority.get(e.kind) ?? 999;
      }
      return basePriority.get(e.kind) ?? 999;
    };

    const pa = prio(a);
    const pb = prio(b);
    if (pa !== pb) return pa - pb;
    return (a.involved ?? []).join("-").localeCompare((b.involved ?? []).join("-"), "ja");
  });
}

export function resolveResearchTimelinePairInteractions(
  fortuneBranch: BranchType,
  targetBranch: BranchType,
  targetPillar: "YEAR" | "MONTH" | "DAY",
  phaseIndex: number,
  ruleset: BundledRuleset,
): TimelineInteractionEntry[] {
  const interaction = ruleset.interaction;
  if (!interaction) return [];
  const enabled = new Set(interaction.enabledKinds);
  const candidates = interaction.patterns
    .filter((pattern) => enabled.has(pattern.kind))
    .filter((pattern) => includesPairPattern(fortuneBranch, targetBranch, pattern.branches))
    .map((pattern) => {
      const branches = pattern.branches as BranchType[];
      return {
        kind: pattern.kind,
        targetPillar,
        fortuneType: "DAIUN" as const,
        phaseIndex,
        involved: branches.map((b) => branchLabel(b)),
      } satisfies TimelineInteractionEntry;
    });

  const priorityIndex = new Map<string, number>(interaction.priorityOrder.map((kind, idx) => [kind, idx]));
  return candidates.sort((a, b) => {
    const pa = priorityIndex.get(a.kind) ?? 999;
    const pb = priorityIndex.get(b.kind) ?? 999;
    if (pa !== pb) return pa - pb;
    return (a.involved ?? []).join("-").localeCompare((b.involved ?? []).join("-"), "ja");
  });
}

/** 大運干支配と命式柱との拡展位相（experimental・scope が NATAL_AND_TIMELINE のとき） */
export function resolveResearchTimelineExtendedPairInteractions(
  fortuneStem: Stem,
  fortuneBranch: BranchType,
  targetStem: Stem,
  targetBranch: BranchType,
  targetPillar: "YEAR" | "MONTH" | "DAY",
  phaseIndex: number,
  ruleset: BundledRuleset,
): TimelineInteractionEntry[] {
  const interaction = ruleset.interaction;
  const ext = interaction?.isouhouExtended;
  if (!ext || ext.scopePolicy !== "NATAL_AND_TIMELINE") return [];

  const enabled = new Set(ext.enabledKinds);
  const hankaiPairs = collectHankaiPairPatterns(ruleset);

  const out: TimelineInteractionEntry[] = [];
  const pairLabel = `DAIUN×${targetPillar}`;

  if (enabled.has("KANGO") && areKangoPair(fortuneStem, targetStem)) {
    out.push({
      kind: "KANGO",
      targetPillar,
      fortuneType: "DAIUN",
      phaseIndex,
      involved: [stemLabel(fortuneStem), stemLabel(targetStem), pairLabel],
    });
  }
  if (enabled.has("NACHION") && fortuneStem === targetStem && areBranchesChong(fortuneBranch, targetBranch)) {
    out.push({
      kind: "NACHION",
      targetPillar,
      fortuneType: "DAIUN",
      phaseIndex,
      involved: [branchLabel(fortuneBranch), branchLabel(targetBranch), pairLabel],
    });
  }
  if (enabled.has("RITSUON") && fortuneStem === targetStem && fortuneBranch === targetBranch) {
    out.push({
      kind: "RITSUON",
      targetPillar,
      fortuneType: "DAIUN",
      phaseIndex,
      involved: [stemLabel(fortuneStem), branchLabel(fortuneBranch), pairLabel],
    });
  }
  if (
    enabled.has("TENKOKUCHICHU") &&
    areStemsTenkokuPair(fortuneStem, targetStem) &&
    areBranchesChong(fortuneBranch, targetBranch)
  ) {
    out.push({
      kind: "TENKOKUCHICHU",
      targetPillar,
      fortuneType: "DAIUN",
      phaseIndex,
      involved: [
        stemLabel(fortuneStem),
        stemLabel(targetStem),
        branchLabel(fortuneBranch),
        branchLabel(targetBranch),
        pairLabel,
      ],
    });
  }
  if (enabled.has("DAIHANKAI") && fortuneStem === targetStem) {
    const match = hankaiPairs.some((br) => includesPairPattern(fortuneBranch, targetBranch, br));
    if (match) {
      out.push({
        kind: "DAIHANKAI",
        targetPillar,
        fortuneType: "DAIUN",
        phaseIndex,
        involved: [stemLabel(fortuneStem), branchLabel(fortuneBranch), branchLabel(targetBranch), pairLabel],
      });
    }
  }

  const extPrio = new Map(ext.priorityOrder.map((k, idx) => [k, idx]));
  return out.sort((a, b) => {
    const pa = extPrio.get(a.kind as (typeof ext.priorityOrder)[number]) ?? 999;
    const pb = extPrio.get(b.kind as (typeof ext.priorityOrder)[number]) ?? 999;
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

function applyLayer3aResearchExperimental(
  interactionRules: InteractionRulesLayer2,
  ruleset: BundledRuleset,
  context: Layer3aContext,
): InteractionRulesLayer2 {
  const interaction = ruleset.interaction;
  const kyokiEnabled = interaction?.kyoki.featureEnabled === true;
  const base = resolveResearchIsouhou(context.insen, ruleset);
  const extendedNatal = resolveExperimentalIsouhouNatal(context.insen, ruleset);
  const isouhou = mergeBaseAndExtendedIsouhou(base, extendedNatal, ruleset);

  const extPv =
    interaction?.isouhouExtended?.priorityVersion ?? interaction?.priorityVersion ?? "default-v1";

  return {
    ...interactionRules,
    isouhou,
    kyoki: kyokiEnabled ? { shadowYousen: undefined } : null,
    resolutionMeta: {
      ruleSetId: ruleset.meta.rulesetVersion,
      priorityVersion: `${interaction?.priorityVersion ?? "default-v1"}+${extPv}`,
      sourceLevel: interaction?.isouhouExtended?.sourceLevel ?? interaction?.sourceLevel ?? "L2_SECONDARY",
    },
  };
}

/** 大運フェーズの interactions 配列を、命式と同じ base/extended 優先で整列する */
export function mergeTimelineBaseAndExtended(
  base: TimelineInteractionEntry[],
  extended: TimelineInteractionEntry[],
  ruleset: BundledRuleset,
): TimelineInteractionEntry[] {
  const interaction = ruleset.interaction;
  const extCfg = interaction?.isouhouExtended;
  const baseFirst = extCfg?.conflictPolicy?.baseKindsFirst !== false;
  const basePriority = new Map<string, number>(
    (interaction?.priorityOrder ?? []).map((k, idx) => [k, idx]),
  );
  const extPriority = new Map<string, number>(
    (extCfg?.priorityOrder ?? []).map((k, idx) => [k, idx]),
  );

  const merged = [...base, ...extended];
  return merged.sort((a, b) => {
    const aExt = EXTENDED_ISOUHOU_KINDS.has(a.kind);
    const bExt = EXTENDED_ISOUHOU_KINDS.has(b.kind);
    if (baseFirst && aExt !== bExt) return aExt ? 1 : -1;
    if (!baseFirst && aExt !== bExt) return aExt ? -1 : 1;
    const pa = aExt ? (extPriority.get(a.kind) ?? 999) : (basePriority.get(a.kind) ?? 999);
    const pb = bExt ? (extPriority.get(b.kind) ?? 999) : (basePriority.get(b.kind) ?? 999);
    if (pa !== pb) return pa - pb;
    return (a.involved ?? []).join("-").localeCompare((b.involved ?? []).join("-"), "ja");
  });
}

const resolverByRulesetVersion: Record<string, Layer3aResolver> = {
  "research-v1": applyLayer3aResearch,
  "research-experimental-v1": applyLayer3aResearchExperimental,
};

export function applyLayer3aByRuleset(
  interactionRules: InteractionRulesLayer2,
  ruleset: BundledRuleset,
  context: Layer3aContext,
): InteractionRulesLayer2 {
  const resolver = resolverByRulesetVersion[ruleset.meta.rulesetVersion] ?? applyLayer3aMock;
  return resolver(interactionRules, ruleset, context);
}
