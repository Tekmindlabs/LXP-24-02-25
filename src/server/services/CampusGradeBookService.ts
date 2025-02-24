import { PrismaClient } from "@prisma/client";
import { GradeBookService } from "./GradeBookService";
import { CampusUserService } from "./CampusUserService";
import { CampusPermission } from "../../types/enums";
import { TRPCError } from "@trpc/server";
import { AssessmentService } from "./AssessmentService";

export class CampusGradeBookService extends GradeBookService {
	constructor(
		private readonly prisma: PrismaClient,
		private readonly campusUserService: CampusUserService,
		assessmentService: AssessmentService
	) {
		super(prisma, assessmentService);
	}

	async initializeCampusGradeBook(
		userId: string,
		campusId: string,
		classId: string
	) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.MANAGE_GRADES
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to manage grades"
			});
		}

		await super.initializeGradeBook(classId);

		// Create sync record
		await this.prisma.gradeBookSync.create({
			data: {
				campusId,
				classId,
				lastSyncedAt: new Date(),
				status: 'SYNCED'
			}
		});
	}

	async syncWithCentral(
		userId: string,
		campusId: string,
		classId: string
	) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.MANAGE_GRADES
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to sync grades"
			});
		}

		const gradeBook = await this.prisma.gradeBook.findFirst({
			where: { classId },
			include: {
				subjectRecords: {
					include: {
						subject: true
					}
				}
			}
		});

		if (!gradeBook) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Grade book not found"
			});
		}

		// Update sync status
		await this.prisma.gradeBookSync.update({
			where: {
				classId_campusId: {
					classId,
					campusId
				}
			},
			data: {
				lastSyncedAt: new Date(),
				status: 'SYNCING'
			}
		});

		try {
			// Sync each subject's grades
			for (const record of gradeBook.subjectRecords) {
				await this.syncSubjectGrades(record.id);
			}

			// Update sync status to completed
			await this.prisma.gradeBookSync.update({
				where: {
					classId_campusId: {
						classId,
						campusId
					}
				},
				data: {
					status: 'SYNCED'
				}
			});
		} catch (error) {
			// Update sync status to failed
			await this.prisma.gradeBookSync.update({
				where: {
					classId_campusId: {
						classId,
						campusId
					}
				},
				data: {
					status: 'FAILED',
					error: error instanceof Error ? error.message : 'Unknown error'
				}
			});

			throw error;
		}
	}

	private async syncSubjectGrades(subjectRecordId: string) {
		const record = await this.prisma.subjectGradeRecord.findUnique({
			where: { id: subjectRecordId },
			include: {
				gradeBook: {
					include: {
						class: true
					}
				}
			}
		});

		if (!record) return;

		// Sync with central database
		await this.prisma.centralGradeSync.create({
			data: {
				subjectGradeRecordId: record.id,
				termGrades: record.termGrades,
				assessmentPeriodGrades: record.assessmentPeriodGrades,
				syncedAt: new Date()
			}
		});
	}

	async getGradeBook(userId: string, campusId: string, classId: string) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.VIEW_GRADES
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to view grades"
			});
		}

		const gradeBook = await this.prisma.gradeBook.findFirst({
			where: { 
				classId,
				class: {
					campusClass: {
						campusId
					}
				}
			},
			include: {
				assessmentSystem: true,
				subjectRecords: {
					include: {
						subject: true
					}
				},
				class: {
					include: {
						classGroup: {
							include: {
								subjects: true
							}
						}
					}
				}
			}
		});

		if (!gradeBook) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Grade book not found"
			});
		}

		return gradeBook;
	}
}