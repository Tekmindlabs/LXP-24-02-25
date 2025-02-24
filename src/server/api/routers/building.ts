import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { buildingSchema, buildingIdSchema, updateBuildingSchema } from "@/types/validation/building";
import { TRPCError } from "@trpc/server";
import { CampusService } from "../../services/campus.service";

export const buildingRouter = createTRPCRouter({
	create: protectedProcedure
		.input(buildingSchema)
		.mutation(async ({ ctx, input }) => {
			const campusService = new CampusService(ctx.prisma);
			return campusService.createBuilding(input);
		}),

	getAll: protectedProcedure
		.input(z.object({ campusId: z.string().optional() }))
		.query(async ({ ctx, input }) => {
			const where = input.campusId ? { campusId: input.campusId } : {};
			return ctx.prisma.building.findMany({
				where,
				include: {
					campus: true,
					floors: {
						include: {
							wings: {
								include: {
									rooms: true
								}
							}
						}
					}
				}
			});
		}),

	getById: protectedProcedure
		.input(buildingIdSchema)
		.query(async ({ ctx, input }) => {
			const building = await ctx.prisma.building.findUnique({
				where: { id: input.id },
				include: {
					campus: true,
					floors: {
						include: {
							wings: {
								include: {
									rooms: true
								}
							}
						}
					}
				}
			});

			if (!building) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Building not found"
				});
			}

			return building;
		}),

	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			data: updateBuildingSchema
		}))
		.mutation(async ({ ctx, input }) => {
			const building = await ctx.prisma.building.update({
				where: { id: input.id },
				data: input.data,
				include: {
					floors: {
						include: {
							wings: {
								include: {
									rooms: true
								}
							}
						}
					}
				}
			});
			return building;
		}),

	delete: protectedProcedure
		.input(buildingIdSchema)
		.mutation(async ({ ctx, input }) => {
			await ctx.prisma.building.delete({
				where: { id: input.id }
			});
			return { success: true };
		})
});