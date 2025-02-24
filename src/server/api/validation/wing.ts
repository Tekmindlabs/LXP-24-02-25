import { z } from "zod";

export const wingSchema = z.object({
	name: z.string().min(1).max(50),
	floorId: z.string(),
});

export const updateWingSchema = wingSchema.partial();

export const wingIdSchema = z.object({
	id: z.string(),
});

export type WingInput = z.infer<typeof wingSchema>;
export type UpdateWingInput = z.infer<typeof updateWingSchema>;
export type WingId = z.infer<typeof wingIdSchema>;