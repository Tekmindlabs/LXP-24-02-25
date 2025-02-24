import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { AttendanceStatus } from "@prisma/client";
import { CampusAttendanceService } from "../../services/CampusAttendanceService";
import { CampusUserService } from "../../services/CampusUserService";

export const campusAttendanceRouter = createTRPCRouter({
	recordAttendance: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			classId: z.string(),
			date: z.date(),
			records: z.array(z.object({
				studentId: z.string(),
				status: z.nativeEnum(AttendanceStatus),
				notes: z.string().optional()
			}))
		}))
		.mutation(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const attendanceService = new CampusAttendanceService(ctx.prisma, campusUserService);

			return attendanceService.recordAttendance(
				ctx.session.user.id,
				input.campusId,
				input.classId,
				input.date,
				input.records
			);
		}),

	updateAttendance: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			attendanceId: z.string(),
			status: z.nativeEnum(AttendanceStatus),
			notes: z.string().optional()
		}))
		.mutation(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const attendanceService = new CampusAttendanceService(ctx.prisma, campusUserService);

			return attendanceService.updateAttendance(
				ctx.session.user.id,
				input.campusId,
				input.attendanceId,
				input.status,
				input.notes
			);
		}),

	getClassAttendance: protectedProcedure
		.input(z.object({
			campusId: z.string(),
			classId: z.string(),
			startDate: z.date(),
			endDate: z.date()
		}))
		.query(async ({ ctx, input }) => {
			const campusUserService = new CampusUserService(ctx.prisma);
			const attendanceService = new CampusAttendanceService(ctx.prisma, campusUserService);

			return attendanceService.getAttendanceByClass(
				ctx.session.user.id,
				input.campusId,
				input.classId,
				input.startDate,
				input.endDate
			);
		})
});