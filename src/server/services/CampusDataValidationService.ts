import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AttendanceStatus } from "../../types/enums";

// Validation schemas
const attendanceSchema = z.object({
	studentId: z.string(),
	status: z.enum([
		AttendanceStatus.PRESENT,
		AttendanceStatus.ABSENT,
		AttendanceStatus.LATE,
		AttendanceStatus.EXCUSED
	]),
	notes: z.string().optional()
});

const gradeSchema = z.object({
	studentId: z.string(),
	grade: z.number().min(0).max(100),
	subjectId: z.string(),
	termId: z.string()
});

const teacherAllocationSchema = z.object({
	teacherId: z.string(),
	classId: z.string(),
	startDate: z.date(),
	endDate: z.date().optional()
});

export class CampusDataValidationService {
	constructor(private readonly db: PrismaClient) {}

	async validateAttendanceData(data: unknown) {
		try {
			const validated = attendanceSchema.parse(data);
			
			// Additional business logic validation
			const studentExists = await this.db.student.findUnique({
				where: { id: validated.studentId }
			});

			if (!studentExists) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Student not found"
				});
			}

			return validated;
		} catch (error) {
			if (error instanceof z.ZodError) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid attendance data format",
					cause: error
				});
			}
			throw error;
		}
	}

	async validateGradeData(data: unknown) {
		try {
			const validated = gradeSchema.parse(data);
			
			// Additional business logic validation
			const [student, subject, term] = await Promise.all([
				this.db.student.findUnique({ where: { id: validated.studentId } }),
				this.db.subject.findUnique({ where: { id: validated.subjectId } }),
				this.db.term.findUnique({ where: { id: validated.termId } })
			]);

			if (!student || !subject || !term) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid reference data"
				});
			}

			return validated;
		} catch (error) {
			if (error instanceof z.ZodError) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid grade data format",
					cause: error
				});
			}
			throw error;
		}
	}

	async validateTeacherAllocation(data: unknown) {
		try {
			const validated = teacherAllocationSchema.parse(data);
			
			// Additional business logic validation
			const [teacher, class_] = await Promise.all([
				this.db.teacher.findUnique({ where: { id: validated.teacherId } }),
				this.db.class.findUnique({ where: { id: validated.classId } })
			]);

			if (!teacher || !class_) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid teacher or class reference"
				});
			}

			// Validate date range
			if (validated.endDate && validated.endDate < validated.startDate) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "End date must be after start date"
				});
			}

			return validated;
		} catch (error) {
			if (error instanceof z.ZodError) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid teacher allocation data format",
					cause: error
				});
			}
			throw error;
		}
	}
}