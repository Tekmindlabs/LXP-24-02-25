import { PrismaClient, Status } from "@prisma/client";
import { CampusRole, CampusType } from "../../src/types/enums";

async function migrateCampusData() {
	const prisma = new PrismaClient();

	try {
		console.log('Starting campus data migration...');

		// Step 1: Migrate existing classes to campus model
		const existingClasses = await prisma.class.findMany({
			where: { status: Status.ACTIVE }
		});

		const defaultCampus = await prisma.campus.findFirst({
			where: { type: CampusType.MAIN }
		});

		if (!defaultCampus) {
			throw new Error('No main campus found for migration');
		}

		// Migrate classes
		for (const class_ of existingClasses) {
			await prisma.campusClass.create({
				data: {
					classId: class_.id,
					campusId: defaultCampus.id,
					status: Status.ACTIVE
				}
			});
		}

		// Step 2: Update user associations
		const teachers = await prisma.teacherProfile.findMany({
			where: { status: Status.ACTIVE }
		});

		for (const teacher of teachers) {
			await prisma.campusTeacher.create({
				data: {
					teacherId: teacher.id,
					campusId: defaultCampus.id,
					status: Status.ACTIVE,
					role: CampusRole.CAMPUS_TEACHER
				}
			});
		}

		const students = await prisma.studentProfile.findMany({
			where: { status: Status.ACTIVE }
		});

		for (const student of students) {
			await prisma.campusStudent.create({
				data: {
					studentId: student.id,
					campusId: defaultCampus.id,
					status: Status.ACTIVE
				}
			});
		}

		// Step 3: Deploy core features
		await prisma.campusFeature.createMany({
			data: [
				{ campusId: defaultCampus.id, featureKey: 'ATTENDANCE', status: Status.ACTIVE },
				{ campusId: defaultCampus.id, featureKey: 'GRADEBOOK', status: Status.ACTIVE },
				{ campusId: defaultCampus.id, featureKey: 'CLASS_MANAGEMENT', status: Status.ACTIVE },
				{ campusId: defaultCampus.id, featureKey: 'USER_MANAGEMENT', status: Status.ACTIVE }
			]
		});

		// Step 4: Enable advanced features gradually
		const advancedFeatures = [
			{ key: 'ANALYTICS', delay: 7 }, // 7 days
			{ key: 'REPORTING', delay: 14 }, // 14 days
			{ key: 'SYNC', delay: 21 } // 21 days
		];

		for (const feature of advancedFeatures) {
			await prisma.campusFeature.create({
				data: {
					campusId: defaultCampus.id,
					featureKey: feature.key,
					status: Status.PENDING,
					enableAfter: new Date(Date.now() + feature.delay * 24 * 60 * 60 * 1000)
				}
			});
		}

		console.log('Campus data migration completed successfully');
	} catch (error) {
		console.error('Migration failed:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run migration
migrateCampusData()
	.catch(console.error)
	.finally(() => process.exit());