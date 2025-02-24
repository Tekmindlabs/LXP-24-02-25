import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Status, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { CampusUserService } from "../../services/CampusUserService";
import { CampusPermission } from "@/types/enums";

export const campusClassRouter = createTRPCRouter({
	create: protectedProcedure
		.input(z.object({
			name: z.string(),
			campusId: z.string(),
			buildingId: z.string(),
			roomId: z.string(),
			capacity: z.number(),
			classGroupId: z.string(), // Add required classGroupId
			status: z.enum([Status.ACTIVE, Status.INACTIVE, Status.ARCHIVED]).optional().default(Status.ACTIVE),
			teacherIds: z.array(z.string()),
			classTutorId: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const hasPermission = await campusUserService.hasPermission(
				ctx.session.user.id,
				input.campusId,
				CampusPermission.MANAGE_CLASSES
			);

			if (!hasPermission) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions"
				});
			}

			const data: Prisma.ClassUncheckedCreateInput = {
				name: input.name,
				capacity: input.capacity,
				status: input.status,
				classGroupId: input.classGroupId,
				buildingId: input.buildingId,
				roomId: input.roomId,
				teachers: {
					create: input.teacherIds.map(teacherId => ({
						teacherId,
						isClassTeacher: teacherId === input.classTutorId,
						status: Status.ACTIVE
					}))
				}
			};

			return ctx.prisma.class.create({
				data,
				include: {
					teachers: {
						include: {
							teacher: {
								include: {
									user: true
								}
							}
						}
					}
				}
			});

		}),

	getByCampus: protectedProcedure
		.input(z.object({
			campusId: z.string()
		}))
		.query(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const hasPermission = await campusUserService.hasPermission(
				ctx.session.user.id,
				input.campusId,
				CampusPermission.VIEW_CAMPUS_CLASSES
			);

			if (!hasPermission) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions"
				});
			}

			return ctx.prisma.class.findMany({
				where: {
					classGroup: {
						campus: {
							id: input.campusId
						}
					}
				},
				include: {
					teachers: {
						include: {
							teacher: {
								include: {
									user: true
								}
							}
						}
					},
					students: {
						include: {
							user: true
						}
					}
				}

			});
		})
});