import { z } from "zod";
import { Status } from "@prisma/client";

export const calendarSchema = z.object({
	id: z.string().optional(),
	name: z.string(),
	description: z.string().optional(),
	startDate: z.date(),
	endDate: z.date(),
	status: z.nativeEnum(Status).default(Status.ACTIVE),
	inheritSettings: z.boolean().optional(),
});

export type CalendarSchema = z.infer<typeof calendarSchema>;