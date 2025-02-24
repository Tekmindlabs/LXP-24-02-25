import { z } from "zod";

export const floorSchema = z.object({
	number: z.number().min(0, "Floor number must be non-negative"),
	buildingId: z.string().min(1, "Building ID is required")
});

export const updateFloorSchema = floorSchema.partial();

export const floorIdSchema = z.object({
	id: z.string().min(1, "Floor ID is required")
});

export type CreateFloorInput = z.infer<typeof floorSchema>;
export type UpdateFloorInput = z.infer<typeof updateFloorSchema>;
export type FloorId = z.infer<typeof floorIdSchema>;