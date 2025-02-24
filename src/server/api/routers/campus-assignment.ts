import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { CampusAssignmentService } from "../../services/CampusAssignmentService";
import { CampusUserService } from "../../services/CampusUserService";

export const campusAssignmentRouter = createTRPCRouter({
	create: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			title: z.string(),
			description: z.string().optional(),
			dueDate: z.date(),
			subjectId: z.string(),
			classId: z.string(),
			totalMarks: z.number(),
			attachments: z.array(z.object({
				url: z.string(),
				type: z.string()
			})).optional()
		}))
		.mutation(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const assignmentService = new CampusAssignmentService(ctx.prisma, campusUserService);

			return assignmentService.createAssignment(
				ctx.session.user.id,
				input.campusId,
				input
			);
		}),

	getClassAssignments: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			classId: z.string()
		}))
		.query(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const assignmentService = new CampusAssignmentService(ctx.prisma, campusUserService);

			return assignmentService.getClassAssignments(
				ctx.session.user.id,
				input.campusId,
				input.classId
			);
		}),

	submit: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			assignmentId: z.string(),
			content: z.any()
		}))
		.mutation(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const assignmentService = new CampusAssignmentService(ctx.prisma, campusUserService);

			return assignmentService.submitAssignment(
				ctx.session.user.id,
				input.campusId,
				input.assignmentId,
				input.content
			);
		}),

	grade: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			submissionId: z.string(),
			grade: z.number(),
			feedback: z.string().optional()
		}))
		.mutation(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const assignmentService = new CampusAssignmentService(ctx.prisma, campusUserService);

			return assignmentService.gradeAssignment(
				ctx.session.user.id,
				input.campusId,
				input.submissionId,
				input.grade,
				input.feedback
			);
		})
});