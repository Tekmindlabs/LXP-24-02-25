import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { CampusUserService } from "./CampusUserService";
import { CampusRole, Status } from "../../types/enums";

export class CampusMigrationService {
	constructor(
		private readonly db: PrismaClient,
		private readonly userService: CampusUserService
	) {}

	async migrateClassesToCampus(campusId: string) {
		return this.db.$transaction(async (tx) => {
			// Get all existing classes
			const classes = await tx.class.findMany({
				where: { status: Status.ACTIVE }
			});

			// Migrate each class to campus model
			for (const class_ of classes) {
				await tx.campusClass.create({
					data: {
						classId: class_.id,
						campusId,
						status: Status.ACTIVE,
						createdAt: new Date(),
						updatedAt: new Date()
					}
				});
			}

			return { migratedCount: classes.length };
		});
	}

	async migrateUserAssociations(campusId: string) {
		return this.db.$transaction(async (tx) => {
			// Migrate teachers
			const teachers = await tx.teacher.findMany({
				where: { status: Status.ACTIVE }
			});

			for (const teacher of teachers) {
				await this.userService.assignCampusRole(teacher.userId, campusId, CampusRole.CAMPUS_TEACHER);
				await tx.campusTeacher.create({
					data: {
						teacherId: teacher.id,
						campusId,
						status: Status.ACTIVE
					}
				});
			}

			// Migrate students
			const students = await tx.student.findMany({
				where: { status: Status.ACTIVE }
			});

			for (const student of students) {
				await this.userService.assignCampusRole(student.userId, campusId, CampusRole.CAMPUS_STUDENT);
				await tx.campusStudent.create({
					data: {
						studentId: student.id,
						campusId,
						status: Status.ACTIVE
					}
				});
			}

			return {
				teacherCount: teachers.length,
				studentCount: students.length
			};
		});
	}

	async deployFeatures(campusId: string) {
		return this.db.$transaction(async (tx) => {
			// Enable core features
			await tx.campusFeature.createMany({
				data: [
					{ campusId, featureKey: 'ATTENDANCE', status: Status.ACTIVE },
					{ campusId, featureKey: 'GRADEBOOK', status: Status.ACTIVE },
					{ campusId, featureKey: 'CLASS_MANAGEMENT', status: Status.ACTIVE },
					{ campusId, featureKey: 'USER_MANAGEMENT', status: Status.ACTIVE }
				]
			});

			// Enable advanced features gradually
			await tx.campusFeature.createMany({
				data: [
					{ campusId, featureKey: 'ANALYTICS', status: Status.PENDING },
					{ campusId, featureKey: 'REPORTING', status: Status.PENDING },
					{ campusId, featureKey: 'SYNC', status: Status.PENDING }
				]
			});

			return { status: 'FEATURES_DEPLOYED' };
		});
	}

	async enableFeature(campusId: string, featureKey: string) {
		return this.db.campusFeature.update({
			where: {
				campusId_featureKey: {
					campusId,
					featureKey
				}
			},
			data: {
				status: Status.ACTIVE,
				enabledAt: new Date()
			}
		});
	}
}