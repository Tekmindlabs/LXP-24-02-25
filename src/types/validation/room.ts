import { z } from "zod";
import { RoomType, RoomStatus } from "../enums";

export const roomSchema = z.object({
	number: z.string().min(1, "Room number is required"),
	wingId: z.string().min(1, "Wing ID is required"),
	type: z.nativeEnum(RoomType),
	capacity: z.number().min(1, "Capacity must be at least 1"),
	status: z.nativeEnum(RoomStatus),
	resources: z.record(z.any()).optional()
});

export const updateRoomSchema = roomSchema.partial();

export const roomIdSchema = z.object({
	id: z.string().min(1, "Room ID is required")
});

export type CreateRoomInput = z.infer<typeof roomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomId = z.infer<typeof roomIdSchema>;