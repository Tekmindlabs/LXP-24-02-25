import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { CampusReportingService } from "../../services/CampusReportingService";
import { CampusUserService } from "../../services/CampusUserService";

export const campusReportingRouter = createTRPCRouter({
	getAttendanceStats: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			startDate: z.date(),
			endDate: z.date()
		}))
		.query(async ({ ctx, input }) => {
			const userService = new CampusUserService(ctx.prisma);
			const reportingService = new CampusReportingService(ctx.prisma, userService);

			return reportingService.getAttendanceStats(
				ctx.session.user.id,
				input.campusId,
				input.startDate,
				input.endDate
			);
		}),

	getAcademicPerformance: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			termId: z.string()
		}))
		.query(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const reportingService = new CampusReportingService(ctx.prisma, campusUserService);

			return reportingService.getAcademicPerformance(
				ctx.session.user.id,
				input.campusId,
				input.termId
			);
		}),

	getTeacherStats: protectedProcedure
		.input(z.object({
			campusId: z.string()
		}))
		.query(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const reportingService = new CampusReportingService(ctx.prisma, campusUserService);

			return reportingService.getTeacherStats(
				ctx.session.user.id,
				input.campusId
			);
		})
});