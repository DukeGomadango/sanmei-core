import { z } from "zod";
import { PillarSchema } from "./layer1.js";

export const ZokanForPillarSchema = z.object({
  zoukanShogen: z.number().int().min(0).max(9),
  zoukanChugen: z.number().int().min(0).max(9),
  zoukanHongen: z.number().int().min(0).max(9),
  activeSlot: z.enum(["ZOUKAN_SHOGEN", "ZOUKAN_CHUGEN", "ZOUKAN_HONGEN"]),
  activeStem: z.number().int().min(0).max(9),
});

export const InsenPillarLayer2Schema = PillarSchema.extend({
  zokan: ZokanForPillarSchema,
});

export const InsenLayer2Schema = z.object({
  year: InsenPillarLayer2Schema,
  month: InsenPillarLayer2Schema,
  day: InsenPillarLayer2Schema,
  displayDepth: z.number().int().nonnegative(),
  rawDelta: z.number().int().nonnegative(),
});

export const MainStarPositionSchema = z.object({
  part: z.enum(["HEAD", "CHEST", "BELLY", "RIGHT_HAND", "LEFT_HAND"]),
  starId: z.string(),
});

export type MainStarPosition = z.infer<typeof MainStarPositionSchema>;

export const SubordinateStarPositionSchema = z.object({
  anchor: z.enum(["YEAR_BRANCH", "MONTH_BRANCH", "DAY_BRANCH"]),
  starId: z.string(),
});

export const YousenLayer2Schema = z.object({
  mainStars: z.array(MainStarPositionSchema).length(5),
  subordinateStars: z.array(SubordinateStarPositionSchema).length(3),
});

export const FamilyLocationSchema = z.object({
  pillar: z.enum(["YEAR", "MONTH", "DAY"]),
  slot: z.enum(["STEM", "ZOUKAN_SHOGEN", "ZOUKAN_CHUGEN", "ZOUKAN_HONGEN"]),
});

export const FamilyNodeSchema = z.object({
  role: z.string(),
  stem: z.number().int().min(0).max(9),
  location: FamilyLocationSchema,
});

export const BaseProfileLayer2Schema = z.object({
  insen: InsenLayer2Schema,
  yousen: YousenLayer2Schema,
  familyNodes: z.array(FamilyNodeSchema),
});

export const InteractionRulesLayer2Schema = z.object({
  guardianDeities: z.array(z.number().int().min(0).max(4)),
  kishin: z.array(z.number().int().min(0).max(4)),
});

export const CalculateMetaSchema = z.object({
  engineVersion: z.string(),
  rulesetVersion: z.string(),
  sect: z.string(),
  calculatedAt: z.string(),
});

export const CalculateResultSchema = z.object({
  meta: CalculateMetaSchema,
  baseProfile: BaseProfileLayer2Schema,
  interactionRules: InteractionRulesLayer2Schema,
});

export type InsenLayer2 = z.infer<typeof InsenLayer2Schema>;
export type YousenLayer2 = z.infer<typeof YousenLayer2Schema>;
export type FamilyNode = z.infer<typeof FamilyNodeSchema>;
export type BaseProfileLayer2 = z.infer<typeof BaseProfileLayer2Schema>;
export type InteractionRulesLayer2 = z.infer<typeof InteractionRulesLayer2Schema>;
export type CalculateResult = z.infer<typeof CalculateResultSchema>;
