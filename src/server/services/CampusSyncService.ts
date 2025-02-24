import { PrismaClient, Status } from "@prisma/client";
import { CampusUserService } from "./CampusUserService";
import { CampusPermission } from "../../types/enums";
import { TRPCError } from "@trpc/server";

interface SyncStatus {
	lastSyncedAt: Date;
	status: 'SYNCED' | 'SYNCING' | 'FAILED';
	error?: string;
}

export class CampusSyncService {
	constructor(
		private readonly db: PrismaClient,
		private readonly campusUserService: CampusUserService
	) {}

	async syncCampusData(
		userId: string,
		campusId: string
	) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.MANAGE_CAMPUS
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to sync campus data"
			});
		}

		return this.db.$transaction(async (tx) => {
			// Update sync status to SYNCING
			await this.updateSyncStatus(tx, campusId, {
				lastSyncedAt: new Date(),
				status: 'SYNCING'
			});

			try {
				// Sync attendance data
				await this.syncAttendance(tx, campusId);

				// Sync grade data
				await this.syncGrades(tx, campusId);

				// Sync teacher allocations
				await this.syncTeacherAllocations(tx, campusId);

				// Update sync status to SYNCED
				await this.updateSyncStatus(tx, campusId, {
					lastSyncedAt: new Date(),
					status: 'SYNCED'
				});

				return { success: true };
			} catch (error) {
				// Update sync status to FAILED
				await this.updateSyncStatus(tx, campusId, {
					lastSyncedAt: new Date(),
					status: 'FAILED',
					error: error instanceof Error ? error.message : 'Unknown error'
				});

				throw error;
			}
		});
	}

	private async syncAttendance(tx: any, campusId: string) {
		const attendance = await tx.attendance.findMany({
			where: {
				class: {
					campus: { id: campusId }
				},
				syncedAt: null
			}
		});

		for (const record of attendance) {
			await tx.centralAttendanceSync.create({
				data: {
					attendanceId: record.id,
					syncedAt: new Date(),
					data: record
				}
			});

			await tx.attendance.update({
				where: { id: record.id },
				data: { syncedAt: new Date() }
			});
		}
	}

	private async syncGrades(tx: any, campusId: string) {
		const grades = await tx.subjectGradeRecord.findMany({
			where: {
				gradeBook: {
					class: {
						campus: { id: campusId }
					}
				},
				syncedAt: null
			}
		});

		for (const record of grades) {
			await tx.centralGradeSync.create({
				data: {
					gradeRecordId: record.id,
					syncedAt: new Date(),
					data: record
				}
			});

			await tx.subjectGradeRecord.update({
				where: { id: record.id },
				data: { syncedAt: new Date() }
			});
		}
	}

	private async syncTeacherAllocations(tx: any, campusId: string) {
		const allocations = await tx.teacherClass.findMany({
			where: {
				class: {
					campus: { id: campusId }
				},
				syncedAt: null
			},
			include: {
				teacher: true,
				class: true
			}
		});

		for (const allocation of allocations) {
			await tx.centralTeacherSync.create({
				data: {
					teacherClassId: allocation.id,
					syncedAt: new Date(),
					data: allocation
				}
			});

			await tx.teacherClass.update({
				where: { id: allocation.id },
				data: { syncedAt: new Date() }
			});
		}
	}

	private async updateSyncStatus(tx: any, campusId: string, status: SyncStatus) {
		return tx.campusSync.upsert({
			where: { campusId },
			update: status,
			create: {
				campusId,
				...status
			}
		});
	}

	async getSyncStatus(
		userId: string,
		campusId: string
	) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.VIEW_CAMPUS
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to view sync status"
			});
		}

		return this.db.campusSync.findUnique({
			where: { campusId }
		});
	}
}