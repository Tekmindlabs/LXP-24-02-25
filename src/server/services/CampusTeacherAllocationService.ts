import { PrismaClient, Status } from "@prisma/client";
import { CampusUserService } from "./CampusUserService";
import { CampusPermission } from "../../types/enums";
import { TRPCError } from "@trpc/server";

interface TeacherAllocationInput {
	teacherId: string;
	classId: string;
	subjectIds: string[];
	isClassTeacher: boolean;
}

export class CampusTeacherAllocationService {
	constructor(
		private readonly db: PrismaClient,
		private readonly campusUserService: CampusUserService
	) {}

	async allocateTeacher(
		userId: string,
		campusId: string,
		data: TeacherAllocationInput
	) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.MANAGE_CAMPUS_USERS
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to allocate teachers"
			});
		}

		return this.db.$transaction(async (tx) => {
			// Create teacher-class relation
			await tx.teacherClass.create({
				data: {
					teacher: { connect: { id: data.teacherId } },
					class: { connect: { id: data.classId } },
					isClassTeacher: data.isClassTeacher,
					status: Status.ACTIVE
				}
			});

			// Create teacher-subject relations
			await tx.teacherSubject.createMany({
				data: data.subjectIds.map(subjectId => ({
					teacherId: data.teacherId,
					subjectId,
					status: Status.ACTIVE
				}))
			});

			return tx.teacherProfile.findUnique({
				where: { id: data.teacherId },
				include: {
					user: true,
					classes: {
						include: {
							class: true
						}
					},
					subjects: {
						include: {
							subject: true
						}
					}
				}
			});
		});
	}

	async updateAllocation(
		userId: string,
		campusId: string,
		teacherId: string,
		classId: string,
		updates: Partial<TeacherAllocationInput>
	) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.MANAGE_CAMPUS_USERS
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to update allocations"
			});
		}

		return this.db.$transaction(async (tx) => {
			if (updates.isClassTeacher !== undefined) {
				await tx.teacherClass.update({
					where: {
						teacherId_classId: {
							teacherId,
							classId
						}
					},
					data: {
						isClassTeacher: updates.isClassTeacher
					}
				});
			}

			if (updates.subjectIds) {
				// Remove existing subject assignments
				await tx.teacherSubject.deleteMany({
					where: { teacherId }
				});

				// Create new subject assignments
				await tx.teacherSubject.createMany({
					data: updates.subjectIds.map(subjectId => ({
						teacherId,
						subjectId,
						status: Status.ACTIVE
					}))
				});
			}

			return tx.teacherProfile.findUnique({
				where: { id: teacherId },
				include: {
					user: true,
					classes: {
						include: {
							class: true
						}
					},
					subjects: {
						include: {
							subject: true
						}
					}
				}
			});
		});
	}

	async removeAllocation(
		userId: string,
		campusId: string,
		teacherId: string,
		classId: string
	) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.MANAGE_CAMPUS_USERS
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to remove allocations"
			});
		}

		return this.db.$transaction(async (tx) => {
			// Remove teacher-class relation
			await tx.teacherClass.delete({
				where: {
					teacherId_classId: {
						teacherId,
						classId
					}
				}
			});

			// Remove associated subject assignments
			await tx.teacherSubject.deleteMany({
				where: { teacherId }
			});

			return { success: true };
		});
	}

	async getTeacherAllocations(
		userId: string,
		campusId: string,
		classId: string
	) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.VIEW_CAMPUS_USERS
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to view allocations"
			});
		}

		return this.db.teacherClass.findMany({
			where: { classId },
			include: {
				teacher: {
					include: {
						user: true,
						subjects: {
							include: {
								subject: true
							}
						}
					}
				}
			}
		});
	}
}