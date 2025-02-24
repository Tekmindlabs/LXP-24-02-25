import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { CampusTeacherAllocationService } from "../../services/CampusTeacherAllocationService";
import { CampusUserService } from "../../services/CampusUserService";

export const campusTeacherAllocationRouter = createTRPCRouter({
	allocate: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			teacherId: z.string(),
			classId: z.string(),
			subjectIds: z.array(z.string()),
			isClassTeacher: z.boolean()
		}))
		.mutation(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const allocationService = new CampusTeacherAllocationService(ctx.prisma, campusUserService);

			return allocationService.allocateTeacher(
				ctx.session.user.id,
				input.campusId,
				input
			);
		}),

	updateAllocation: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			teacherId: z.string(),
			classId: z.string(),
			updates: z.object({
				subjectIds: z.array(z.string()).optional(),
				isClassTeacher: z.boolean().optional()
			})
		}))
		.mutation(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const allocationService = new CampusTeacherAllocationService(ctx.prisma, campusUserService);

			return allocationService.updateAllocation(
				ctx.session.user.id,
				input.campusId,
				input.teacherId,
				input.classId,
				input.updates
			);
		}),

	removeAllocation: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			teacherId: z.string(),
			classId: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const allocationService = new CampusTeacherAllocationService(ctx.prisma, campusUserService);

			return allocationService.removeAllocation(
				ctx.session.user.id,
				input.campusId,
				input.teacherId,
				input.classId
			);
		}),

	getClassAllocations: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			classId: z.string()
		}))
		.query(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const allocationService = new CampusTeacherAllocationService(ctx.prisma, campusUserService);

			return allocationService.getTeacherAllocations(
				ctx.session.user.id,
				input.campusId,
				input.classId
			);
		})
});