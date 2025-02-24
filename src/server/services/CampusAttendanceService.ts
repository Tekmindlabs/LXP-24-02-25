import { PrismaClient, Status, AttendanceStatus } from "@prisma/client";
import { CampusUserService } from "./CampusUserService";
import { CampusPermission } from "../../types/enums";
import { TRPCError } from "@trpc/server";

interface AttendanceRecord {
	studentId: string;
	status: AttendanceStatus;
	notes?: string;
}

export class CampusAttendanceService {
	constructor(
		private readonly db: PrismaClient,
		private readonly campusUserService: CampusUserService
	) {}

	async recordAttendance(
		userId: string,
		campusId: string,
		classId: string,
		date: Date,
		records: AttendanceRecord[]
	) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.MANAGE_ATTENDANCE
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to record attendance"
			});
		}

		return this.db.$transaction(async (tx) => {
			// Create attendance records
			const attendanceRecords = await Promise.all(
				records.map(record => 
					tx.attendance.create({
						data: {
							student: { connect: { id: record.studentId } },
							class: { connect: { id: classId } },
							date,
							status: record.status,
							notes: record.notes,
							markedBy: { connect: { id: userId } }
						}
					})
				)
			);

			// Create audit records
			await Promise.all(
				attendanceRecords.map(record =>
					tx.attendanceAudit.create({
						data: {
							attendance: { connect: { id: record.id } },
							modifiedBy: userId,
							modifiedAt: new Date(),
							oldValue: AttendanceStatus.ABSENT,
							newValue: record.status,
							reason: "Initial attendance record"
						}
					})
				)
			);

			return attendanceRecords;
		});
	}

	async updateAttendance(
		userId: string,
		campusId: string,
		attendanceId: string,
		status: AttendanceStatus,
		notes?: string
	) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.MANAGE_ATTENDANCE
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to update attendance"
			});
		}

		const currentRecord = await this.db.attendance.findUnique({
			where: { id: attendanceId }
		});

		if (!currentRecord) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Attendance record not found"
			});
		}

		return this.db.$transaction(async (tx) => {
			// Update attendance record
			const updatedRecord = await tx.attendance.update({
				where: { id: attendanceId },
				data: { status, notes }
			});

			// Create audit record
			await tx.attendanceAudit.create({
				data: {
					attendance: { connect: { id: attendanceId } },
					modifiedBy: userId,
					modifiedAt: new Date(),
					oldValue: currentRecord.status,
					newValue: status,
					reason: "Manual update"
				}
			});

			return updatedRecord;
		});
	}

	async getAttendanceByClass(
		userId: string,
		campusId: string,
		classId: string,
		startDate: Date,
		endDate: Date
	) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.VIEW_ATTENDANCE
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to view attendance"
			});
		}

		return this.db.attendance.findMany({
			where: {
				classId,
				date: {
					gte: startDate,
					lte: endDate
				}
			},
			include: {
				student: {
					include: {
						user: true
					}
				},
				audits: true
			}
		});
	}
}