import { z } from "zod";

/** mock-v1 トップレベル（`src/data/rulesets/mock-v1.json`） */
export const RulesetMockV1MetaSchema = z.object({
  rulesetVersion: z.literal("mock-v1"),
  description: z.string(),
  /** L2c 等のブロック追加世代。`rulesetVersion` 文字列は据え置きでもスキーマ世代を追跡する。 */
  schemaRevision: z.number().int().nonnegative(),
});

/** 十干すべて必須（mock の energy 合算用）。 */
export const EnergyWeightsSchema = z.object({
  甲: z.number().int(),
  乙: z.number().int(),
  丙: z.number().int(),
  丁: z.number().int(),
  戊: z.number().int(),
  己: z.number().int(),
  庚: z.number().int(),
  辛: z.number().int(),
  壬: z.number().int(),
  癸: z.number().int(),
});

export const EnergyMockSchema = z.object({
  /** `totalEnergy` が (t1,t2,t3] 区分で actionAreaSize 1〜4（累積上界）。 */
  actionAreaThresholds: z.tuple([z.number().int(), z.number().int(), z.number().int()]),
});

export const DestinyBugRulesSchema = z.object({
  abnormalKanshiNormal: z.array(z.string()),
  abnormalKanshiDark: z.array(z.string()),
  shukumeiTenchusatsuYear: z.array(z.string()),
  shukumeiTenchusatsuMonth: z.array(z.string()),
});

const twoLevelStringTable = z.record(z.string(), z.record(z.string(), z.string()));

const elementCode = z.enum(["WOOD", "FIRE", "EARTH", "METAL", "WATER"]);
const twoLevelElementArrays = z.record(z.string(), z.record(z.string(), z.array(elementCode)));

const mainStarsTable = z.record(z.string(), z.record(z.string(), z.string()));

export const ZokanRuleSchema = z.object({
  stems: z.tuple([z.string(), z.string(), z.string()]),
  upperBounds: z.tuple([z.number().int().positive(), z.number().int().positive()]),
});

export const FamilyNodeRuleSchema = z.object({
  whenDayStem: z.string().min(1),
  role: z.string().min(1),
  relativeStemOffset: z.number().int(),
  locationPillar: z.enum(["YEAR", "MONTH", "DAY"]),
  locationSlot: z.enum(["STEM", "ZOUKAN_SHOGEN", "ZOUKAN_CHUGEN", "ZOUKAN_HONGEN"]),
});

/** dynamicTimeline mock: 満年齢ベースの currentPhase。厳密な節入り境界は監修 ruleset 側。 */
export const TimelineMockSchema = z.object({
  fixedStartAge: z.number().int().nonnegative(),
  phaseSpanYears: z.number().int().positive(),
  firstPhaseSexagenaryIndex: z.number().int().min(0).max(59),
  phaseCount: z.number().int().min(1).max(32),
  annualStarPlaceholder: z.string().min(1),
});

export const IsouhouKindSchema = z.enum([
  "SHIGO",
  "HOSANUI",
  "HANKAI",
  "SANGOU",
  "TAICHU",
  "GAI",
  "KEI",
  "HA",
]);

export const InteractionPatternSchema = z.object({
  kind: IsouhouKindSchema,
  branches: z.array(z.number().int().min(0).max(11)).min(2).max(3),
});

export const InteractionRulesetSchema = z.object({
  enabledKinds: z.array(IsouhouKindSchema),
  patterns: z.array(InteractionPatternSchema),
  priorityOrder: z.array(IsouhouKindSchema),
  priorityVersion: z.string().optional(),
  sourceLevel: z.string().optional(),
  kyoki: z.object({
    featureEnabled: z.boolean(),
  }),
  kaku: z
    .object({
      candidateRules: z.array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          priority: z.number().int(),
          tags: z.array(z.string()).optional(),
          requiresIsouhouKindsAny: z.array(IsouhouKindSchema).optional(),
          requiresKyokiShadow: z.boolean().optional(),
        }),
      ),
      selectionPolicy: z.object({
        resolveMode: z.enum(["MULTI", "SINGLE"]),
        maxResolved: z.number().int().positive().optional(),
      }),
      allowGohouInKakuPolicy: z.object({
        whenFalseSuppressTags: z.array(z.string()),
      }),
      evaluateShadowProfile: z.boolean(),
    })
    .optional(),
});

const rulesetBodySchema = z.object({
  energyWeights: EnergyWeightsSchema,
  energyMock: EnergyMockSchema,
  destinyBugRules: DestinyBugRulesSchema,
  subordinateStars: twoLevelStringTable,
  mainStars: mainStarsTable,
  guardianByDayStemMonthBranch: twoLevelElementArrays,
  kishinByDayStemMonthBranch: twoLevelElementArrays,
  zokanRules: z.record(z.string(), ZokanRuleSchema),
  familyRules: z.object({
    mockV1Nodes: z.array(FamilyNodeRuleSchema),
  }),
  timelineMock: TimelineMockSchema,
  interaction: InteractionRulesetSchema.optional(),
});

export const RulesetMockV1Schema = z
  .object({
    meta: RulesetMockV1MetaSchema,
  })
  .merge(rulesetBodySchema);

export const RulesetMockInternalV2MetaSchema = z.object({
  rulesetVersion: z.literal("mock-internal-v2"),
  description: z.string(),
  schemaRevision: z.number().int().nonnegative(),
});

/** レジストリ検証用の第 2 バンドル（本文は mock-v1 と同一形）。 */
export const RulesetMockInternalV2Schema = z
  .object({
    meta: RulesetMockInternalV2MetaSchema,
  })
  .merge(rulesetBodySchema);

export const RulesetResearchV1MetaSchema = z.object({
  rulesetVersion: z.literal("research-v1"),
  description: z.string(),
  schemaRevision: z.number().int().nonnegative(),
});

/**
 * 研究流派の契約準備バンドル。
 * M1 では本文を mock-v1 互換で保持し、M2 以降で interaction ブロック等を段階追加する。
 */
export const RulesetResearchV1Schema = z
  .object({
    meta: RulesetResearchV1MetaSchema,
  })
  .merge(
    rulesetBodySchema.extend({
      interaction: InteractionRulesetSchema,
    }),
  );

export const BundledRulesetSchema = z.union([
  RulesetMockV1Schema,
  RulesetMockInternalV2Schema,
  RulesetResearchV1Schema,
]);

export type RulesetMockV1 = z.infer<typeof RulesetMockV1Schema>;
export type BundledRuleset = z.infer<typeof BundledRulesetSchema>;

/** サポートするバンドル版（`RULESET_VERSION_UNSUPPORTED` 判定用） */
export const BUNDLED_RULESET_VERSIONS = ["mock-v1", "mock-internal-v2", "research-v1"] as const;
export type BundledRulesetVersion = (typeof BUNDLED_RULESET_VERSIONS)[number];
