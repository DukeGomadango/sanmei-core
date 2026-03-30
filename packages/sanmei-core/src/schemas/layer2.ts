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

export const DestinyBugCodeSchema = z.enum([
  "SHUKUMEI_TENCHUSATSU_YEAR",
  "SHUKUMEI_TENCHUSATSU_MONTH",
  "IJOU_KANSHI_NORMAL",
  "IJOU_KANSHI_DARK",
]);

export type DestinyBugCode = z.infer<typeof DestinyBugCodeSchema>;

/** リゾルバは重複を付与し得る。JSON 応答は初出順のユニーク配列に正規化する。 */
export const DestinyBugsSchema = z
  .array(DestinyBugCodeSchema)
  .transform((a) => [...new Set(a)] as DestinyBugCode[]);

export const ActionAreaGeometrySchema = z.object({
  vertexAnglesDegTenths: z.tuple([
    z.number().int(),
    z.number().int(),
    z.number().int(),
  ]),
  areaRatioPermille: z.number().int().min(0).max(1000),
});

export const EnergyDataSchema = z.object({
  totalEnergy: z.number().int(),
  actionAreaSize: z.number().int().min(1).max(4),
  actionAreaGeometry: ActionAreaGeometrySchema,
});

export type EnergyData = z.infer<typeof EnergyDataSchema>;

export const BaseProfileLayer2Schema = z.object({
  insen: InsenLayer2Schema,
  yousen: YousenLayer2Schema,
  familyNodes: z.array(FamilyNodeSchema),
  energyData: EnergyDataSchema,
  destinyBugs: DestinyBugsSchema,
});

export const IsouhouEntrySchema = z.object({
  kind: z.string(),
  strength: z.number().optional(),
  involved: z.array(z.string()).optional(),
  scope: z.string().optional(),
});

export type IsouhouEntry = z.infer<typeof IsouhouEntrySchema>;

export const InteractionRulesLayer2Schema = z.object({
  guardianDeities: z.array(z.number().int().min(0).max(4)),
  kishin: z.array(z.number().int().min(0).max(4)),
  isouhou: z.array(IsouhouEntrySchema),
  kyoki: z
    .object({
      shadowYousen: YousenLayer2Schema.optional(),
    })
    .nullable(),
  priorityResolution: z.unknown().optional(),
  debugTrace: z.unknown().optional(),
});

export const DaiunPhaseSchema = z.object({
  phaseIndex: z.number().int().nonnegative(),
  sexagenaryIndex: z.number().int().min(0).max(59),
  spanYears: z.number().int().positive(),
});

export const DaiunTimelineSchema = z.object({
  startAge: z.number().int().nonnegative(),
  phases: z.array(DaiunPhaseSchema),
  currentPhase: DaiunPhaseSchema,
});

export const AnnualTimelineSchema = z.object({
  calendarYear: z.number().int(),
  sexagenaryIndex: z.number().int().min(0).max(59),
  relatedStarId: z.string(),
});

export const DynamicTimelineSchema = z.object({
  daiun: DaiunTimelineSchema,
  annual: AnnualTimelineSchema,
  monthly: z.record(z.string(), z.unknown()).optional(),
  tenchuSatsuStatus: z.record(z.string(), z.unknown()).optional(),
});

export type DaiunPhase = z.infer<typeof DaiunPhaseSchema>;
export type DaiunTimeline = z.infer<typeof DaiunTimelineSchema>;
export type AnnualTimeline = z.infer<typeof AnnualTimelineSchema>;
export type DynamicTimeline = z.infer<typeof DynamicTimelineSchema>;

export const CalculateMetaSchema = z.object({
  engineVersion: z.string(),
  rulesetVersion: z.string(),
  sect: z.string(),
  calculatedAt: z.string(),
});

export const CalculateResultSchema = z.object({
  meta: CalculateMetaSchema,
  baseProfile: BaseProfileLayer2Schema,
  dynamicTimeline: DynamicTimelineSchema,
  interactionRules: InteractionRulesLayer2Schema,
});

export type InsenLayer2 = z.infer<typeof InsenLayer2Schema>;
export type YousenLayer2 = z.infer<typeof YousenLayer2Schema>;
export type FamilyNode = z.infer<typeof FamilyNodeSchema>;
export type BaseProfileLayer2 = z.infer<typeof BaseProfileLayer2Schema>;
export type InteractionRulesLayer2 = z.infer<typeof InteractionRulesLayer2Schema>;
export type CalculateResult = z.infer<typeof CalculateResultSchema>;
