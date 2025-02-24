import { z } from "zod";

export const wingSchema = z.object({
	name: z.string().min(1, "Name is required"),
	floorId: z.string().min(1, "Floor ID is required")
});

export const updateWingSchema = wingSchema.partial();

export const wingIdSchema = z.object({
	id: z.string().min(1, "Wing ID is required")
});

export type CreateWingInput = z.infer<typeof wingSchema>;
export type UpdateWingInput = z.infer<typeof updateWingSchema>;
export type WingId = z.infer<typeof wingIdSchema>;