import { z } from "zod";

export const floorSchema = z.object({
	number: z.number().int().min(0),
	buildingId: z.string(),
});

export const updateFloorSchema = floorSchema.partial();

export const floorIdSchema = z.object({
	id: z.string(),
});

export type FloorInput = z.infer<typeof floorSchema>;
export type UpdateFloorInput = z.infer<typeof updateFloorSchema>;
export type FloorId = z.infer<typeof floorIdSchema>;