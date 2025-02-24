import { z } from "zod";

export const buildingSchema = z.object({
	name: z.string().min(2).max(100),
	code: z.string().min(2).max(20),
	campusId: z.string(),
});

export const updateBuildingSchema = buildingSchema.partial();

export const buildingIdSchema = z.object({
	id: z.string(),
});

export type BuildingInput = z.infer<typeof buildingSchema>;
export type UpdateBuildingInput = z.infer<typeof updateBuildingSchema>;
export type BuildingId = z.infer<typeof buildingIdSchema>;