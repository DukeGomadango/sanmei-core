import { z } from "zod";

/** mock-v1 トップレベル（`src/data/rulesets/mock-v1.json`） */
export const RulesetMockV1MetaSchema = z.object({
  rulesetVersion: z.literal("mock-v1"),
  description: z.string(),
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
