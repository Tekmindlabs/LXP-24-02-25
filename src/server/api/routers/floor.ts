import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { floorSchema, floorIdSchema, updateFloorSchema } from "@/types/validation/floor";
import { TRPCError } from "@trpc/server";
import { CampusService } from "../../services/campus.service";

export const floorRouter = createTRPCRouter({
	create: protectedProcedure
		.input(floorSchema)
		.mutation(async ({ ctx, input }) => {
			const campusService = new CampusService(ctx.prisma);
			return campusService.createFloor(input);
		}),

	getAll: protectedProcedure
		.input(z.object({ buildingId: z.string().optional() }))
		.query(async ({ ctx, input }) => {
			const where = input.buildingId ? { buildingId: input.buildingId } : {};
			return ctx.prisma.floor.findMany({
				where,
				include: {
					building: true,
					wings: {
						include: {
							rooms: true
						}
					}
				},
				orderBy: {
					number: 'asc'
				}
			});
		}),

	getById: protectedProcedure
		.input(floorIdSchema)
		.query(async ({ ctx, input }) => {
			const floor = await ctx.prisma.floor.findUnique({
				where: { id: input.id },
				include: {
					building: true,
					wings: {
						include: {
							rooms: true
						}
					}
				}
			});

			if (!floor) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Floor not found"
				});
			}

			return floor;
		}),

	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			data: updateFloorSchema
		}))
		.mutation(async ({ ctx, input }) => {
			const floor = await ctx.prisma.floor.update({
				where: { id: input.id },
				data: input.data,
				include: {
					wings: {
						include: {
							rooms: true
						}
					}
				}
			});
			return floor;
		}),

	delete: protectedProcedure
		.input(floorIdSchema)
		.mutation(async ({ ctx, input }) => {
			await ctx.prisma.floor.delete({
				where: { id: input.id }
			});
			return { success: true };
		})
});