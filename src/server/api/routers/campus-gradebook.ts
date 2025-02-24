import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { CampusGradeBookService } from "../../services/CampusGradeBookService";
import { CampusUserService } from "../../services/CampusUserService";
import { AssessmentService } from "../../services/AssessmentService";

export const campusGradeBookRouter = createTRPCRouter({
	initialize: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			classId: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const assessmentService = new AssessmentService(ctx.prisma);
			const gradeBookService = new CampusGradeBookService(
				ctx.prisma,
				campusUserService,
				assessmentService
			);

			return gradeBookService.initializeCampusGradeBook(
				ctx.session.user.id,
				input.campusId,
				input.classId
			);
		}),

	syncWithCentral: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			classId: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const assessmentService = new AssessmentService(ctx.prisma);
			const gradeBookService = new CampusGradeBookService(
				ctx.prisma,
				campusUserService,
				assessmentService
			);

			return gradeBookService.syncWithCentral(
				ctx.session.user.id,
				input.campusId,
				input.classId
			);
		}),

	getGradeBook: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			classId: z.string()
		}))
		.query(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const assessmentService = new AssessmentService(ctx.prisma);
			const gradeBookService = new CampusGradeBookService(
				ctx.prisma,
				campusUserService,
				assessmentService
			);

			return gradeBookService.getGradeBook(
				ctx.session.user.id,
				input.campusId,
				input.classId
			);
		})
});