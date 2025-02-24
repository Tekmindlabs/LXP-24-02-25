import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { TeacherProfile } from "../../types/teacher";
import { CampusPermission } from "../../types/enums";
import { CampusUserService } from "./CampusUserService";

interface AttendanceStats {
	className: string;
	attendanceRate: number;
}

interface SubjectStats {
	subjectId: string;
	subjectName: string;
	average: number;
	passingRate: number;
}

interface TeacherStats {
	teacherId: string;
	teacherName: string;
	classCount: number;
	subjectCount: number;
	attendanceStats: AttendanceStats[];
	subjectStats: SubjectStats[];
}


export class CampusReportingService {
	constructor(
		private readonly db: PrismaClient,
		private readonly userService: CampusUserService
	) {}

	async getAttendanceStats(
		userId: string,
		campusId: string,
		startDate: Date,
		endDate: Date
	): Promise<AttendanceStats[]> {
		const hasPermission = await this.userService.hasPermission(
			userId,
			campusId,
			CampusPermission.VIEW_REPORTS
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to view attendance stats"
			});
		}

		try {
			const attendanceData = await this.db.$queryRaw<Array<{
				className: string;
				present: number;
				total: number;
			}>>`
				SELECT 
					c.name as className,
					COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) as present,
					COUNT(*) as total
				FROM attendance a
				JOIN classes c ON a.class_id = c.id
				WHERE c.campus_id = ${campusId}
				AND a.date BETWEEN ${startDate} AND ${endDate}
				GROUP BY c.id, c.name
			`;


			return attendanceData.map(data => ({
				className: data.className,
				attendanceRate: (data.present / data.total) * 100
			}));
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch attendance stats"
			});
		}
	}


	async getAcademicPerformance(
		userId: string,
		campusId: string,
		termId: string
	): Promise<SubjectStats[]> {
		const hasPermission = await this.userService.hasPermission(
			userId,
			campusId,
			CampusPermission.VIEW_REPORTS
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to view academic performance"
			});
		}

		try {
			const subjectData = await this.db.$queryRaw<Array<{
				subjectId: string;
				subjectName: string;
				grades: number[];
				passing: number;
				total: number;
			}>>`
				SELECT 
					s.id as subjectId,
					s.name as subjectName,
					ARRAY_AGG(gr.grade) as grades,
					COUNT(CASE WHEN gr.grade >= 60 THEN 1 END) as passing,
					COUNT(*) as total
				FROM subjects s
				JOIN grade_records gr ON s.id = gr.subject_id
				JOIN classes c ON gr.class_id = c.id
				WHERE c.campus_id = ${campusId}
				GROUP BY s.id, s.name
			`;

			return subjectData.map(subject => ({
				subjectId: subject.subjectId,
				subjectName: subject.subjectName,
				average: subject.grades.reduce((a, b) => a + b, 0) / subject.grades.length,
				passingRate: (subject.passing / subject.total) * 100
			}));
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch academic performance"
			});
		}
	}


	async getTeacherStats(userId: string, campusId: string): Promise<TeacherStats[]> {
		const hasPermission = await this.userService.hasPermission(
			userId,
			campusId,
			CampusPermission.VIEW_REPORTS
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to view teacher stats"
			});
		}

		try {
			const teachers = await this.db.teacherProfile.findMany({
				where: { campusId },
				include: {
					user: true,
					subjects: true,
					classes: true
				}
			});

			return teachers.map(teacher => ({
				teacherId: teacher.id,
				teacherName: teacher.user?.name || 'Unknown',
				classCount: teacher.classes?.length || 0,
				subjectCount: teacher.subjects?.length || 0,
				attendanceStats: [], // Will be implemented if needed
				subjectStats: [] // Will be implemented if needed
			}));
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch teacher stats"
			});
		}
	}




}