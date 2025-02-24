import { z } from "zod";

export const buildingSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
	code: z.string().min(2, "Code must be at least 2 characters").max(20, "Code must be at most 20 characters"),
	campusId: z.string().min(1, "Campus ID is required")
});

export const updateBuildingSchema = buildingSchema.partial();

export const buildingIdSchema = z.object({
	id: z.string().min(1, "Building ID is required")
});

export type CreateBuildingInput = z.infer<typeof buildingSchema>;
export type UpdateBuildingInput = z.infer<typeof updateBuildingSchema>;
export type BuildingId = z.infer<typeof buildingIdSchema>;