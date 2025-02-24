import { z } from "zod";
import { RoomStatus, RoomType } from "@prisma/client";

export const roomSchema = z.object({
	number: z.string().min(1).max(20),
	wingId: z.string(),
	type: z.nativeEnum(RoomType),
	capacity: z.number().int().min(1),
	status: z.nativeEnum(RoomStatus).default(RoomStatus.ACTIVE),
	resources: z.any().optional(),
});

export const updateRoomSchema = roomSchema.partial();

export const roomIdSchema = z.object({
	id: z.string(),
});

export type RoomInput = z.infer<typeof roomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomId = z.infer<typeof roomIdSchema>;