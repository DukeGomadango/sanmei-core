import { z } from "zod";
import { BirthInputSchema } from "./layer1.js";

export const CalculateUserSchema = BirthInputSchema.extend({
  gender: z.enum(["male", "female"]),
  birthLongitude: z.number().optional(),
  birthCityCode: z.string().nullable().optional(),
});

export const CalculateContextSchema = z.object({
  asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  asOfTime: z.string().optional(),
  timeZone: z.string().min(1),
});

export const CalculateSystemConfigSchema = z.object({
  sect: z.string().min(1),
  rulesetVersion: z.string().min(1),
  allowGohouInKaku: z.boolean().optional(),
  clientRulesetHint: z.string().nullable().optional(),
});

export const CalculateInputSchema = z.object({
  user: CalculateUserSchema,
  context: CalculateContextSchema,
  systemConfig: CalculateSystemConfigSchema,
  options: z
    .object({
      includeDebugTrace: z.boolean().optional(),
    })
    .optional(),
});

export type CalculateInput = z.infer<typeof CalculateInputSchema>;
export type CalculateUser = z.infer<typeof CalculateUserSchema>;
export type CalculateContext = z.infer<typeof CalculateContextSchema>;
export type CalculateSystemConfig = z.infer<typeof CalculateSystemConfigSchema>;
