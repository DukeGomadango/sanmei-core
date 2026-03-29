import { z } from "zod";

/** Layer1 リクエスト片（将来 calculate の user サブセット） */
export const BirthInputSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable(),
  timeZoneId: z.string().min(1),
});

export type BirthInput = z.infer<typeof BirthInputSchema>;

export const PillarSchema = z.object({
  stem: z.number().int().min(0).max(9),
  branch: z.number().int().min(0).max(11),
});

export const InsenThreePillarsSchema = z.object({
  year: PillarSchema,
  month: PillarSchema,
  day: PillarSchema,
});
