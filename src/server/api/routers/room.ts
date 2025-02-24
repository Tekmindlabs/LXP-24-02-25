import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { roomSchema, roomIdSchema, updateRoomSchema } from "@/types/validation/room";
import { TRPCError } from "@trpc/server";
import { RoomStatus, RoomType } from "@/types/enums";
import { RoomSchedulingService } from "../../services/RoomSchedulingService";
import { RoomResourceService } from "../../services/RoomResourceService";
import { RoomReportingService } from "../../services/RoomReportingService";
import { RoomCache } from "@/lib/cache/RoomCache";
import { CampusService } from "../../services/campus.service";
import { DateTime } from "luxon";

const roomCache = new RoomCache();
const schedulingService = new RoomSchedulingService();
const resourceService = new RoomResourceService();
const reportingService = new RoomReportingService();

export const roomRouter = createTRPCRouter({
	create: protectedProcedure
		.input(roomSchema)
		.mutation(async ({ ctx, input }) => {
			const campusService = new CampusService(ctx.prisma);
			const room = await campusService.createRoom(input);
			await roomCache.set(room.id, room);
			return room;
		}),

	getAll: protectedProcedure
		.input(z.object({ 
			wingId: z.string().optional(),
			type: z.nativeEnum(RoomType).optional(),
			status: z.nativeEnum(RoomStatus).optional(),
		}))
		.query(async ({ ctx, input }) => {
			const where: {
				wingId?: string;
				type?: RoomType;
				status?: RoomStatus;
			} = {};
			
			if (input.wingId) where.wingId = input.wingId;
			if (input.type) where.type = input.type;
			if (input.status) where.status = input.status;
			
			const rooms = await ctx.prisma.room.findMany({
				where,
				include: {
					wing: {
						include: {
							floor: {
								include: {
									building: true,
								},
							},
						},
					},
				},
				orderBy: {
					number: 'asc',
				},
			});
			await roomCache.setMany(rooms);
			return rooms;
		}),

	getById: protectedProcedure
		.input(roomIdSchema)
		.query(async ({ ctx, input }) => {
			const cached = await roomCache.get(input.id);
			if (cached) return cached;

			const room = await ctx.prisma.room.findUnique({
				where: { id: input.id },
				include: {
					wing: {
						include: {
							floor: {
								include: {
									building: true,
								},
							},
						},
					},
				},
			});

			if (!room) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Room not found",
				});
			}

			await roomCache.set(room.id, room);
			return room;
		}),

	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			data: updateRoomSchema,
		}))
		.mutation(async ({ ctx, input }) => {
			const room = await ctx.prisma.room.update({
				where: { id: input.id },
				data: input.data,
			});
			await roomCache.set(room.id, room);
			return room;
		}),

	updateStatus: protectedProcedure
		.input(z.object({
			id: z.string(),
			status: z.nativeEnum(RoomStatus),
		}))
		.mutation(async ({ ctx, input }) => {
			const room = await ctx.prisma.room.update({
				where: { id: input.id },
				data: { status: input.status },
			});
			await roomCache.set(room.id, room);
			return room;
		}),

	delete: protectedProcedure
		.input(roomIdSchema)
		.mutation(async ({ ctx, input }) => {
			await ctx.prisma.room.delete({
				where: { id: input.id },
			});
			await roomCache.invalidate(input.id);
			return { success: true };
		}),

	// Batch operations
	batchCreate: protectedProcedure
		.input(z.array(roomSchema))
		.mutation(async ({ ctx, input }) => {
			const rooms = await ctx.prisma.$transaction(
				input.map(room => ctx.prisma.room.create({ data: room }))
			);
			await roomCache.setMany(rooms);
			return rooms;
		}),

	batchUpdate: protectedProcedure
		.input(z.array(z.object({
			id: z.string(),
			data: updateRoomSchema,
		})))
		.mutation(async ({ ctx, input }) => {
			const rooms = await ctx.prisma.$transaction(
				input.map(({ id, data }) => 
					ctx.prisma.room.update({ where: { id }, data })
				)
			);
			await roomCache.setMany(rooms);
			return rooms;
		}),

	// Scheduling endpoints
	checkAvailability: protectedProcedure
		.input(z.object({
			roomId: z.string(),
			startTime: z.date(),
			endTime: z.date(),
			dayOfWeek: z.number().min(1).max(7),
		}))
		.query(async ({ input }) => {
			return schedulingService.checkRoomAvailability(
				input.roomId,
				DateTime.fromJSDate(input.startTime),
				DateTime.fromJSDate(input.endTime),

				input.dayOfWeek
			);
		}),

	// Resource management endpoints
	updateResources: protectedProcedure
		.input(z.object({
			roomId: z.string(),
			resources: z.array(z.object({
				type: z.enum(['PROJECTOR', 'COMPUTER', 'WHITEBOARD', 'AUDIO_SYSTEM']),
				quantity: z.number().min(1),
				status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE']),
				metadata: z.record(z.string(), z.any()).optional(),
			}))
		}))
		.mutation(async ({ input }) => {
			await resourceService.updateRoomResources(input.roomId, input.resources);
			await roomCache.invalidate(input.roomId);
			return { success: true };
		}),

	// Reporting endpoints
	generateUsageReport: protectedProcedure
		.input(z.object({
			startDate: z.date(),
			endDate: z.date(),
		}))
		.query(async ({ input }) => {
			return reportingService.generateUsageReport({ 
				startDate: input.startDate, 
				endDate: input.endDate 
			});
		}),

	generateUtilizationReport: protectedProcedure
		.input(z.object({
			roomId: z.string(),
		}))
		.query(async ({ input }) => {
			return reportingService.generateResourceUtilizationReport(input.roomId);
		}),

	generateMaintenanceReport: protectedProcedure
		.query(async () => {
			return reportingService.generateMaintenanceReport();
		}),
});