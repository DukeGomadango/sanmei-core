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

export const RulesetMockV1Schema = z.object({
  meta: RulesetMockV1MetaSchema,
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
});

export type RulesetMockV1 = z.infer<typeof RulesetMockV1Schema>;
