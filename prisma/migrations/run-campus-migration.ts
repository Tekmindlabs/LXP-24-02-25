import { PrismaClient } from "@prisma/client";
import { CampusMigrationService } from "../../src/server/services/CampusMigrationService";
import { CampusUserService } from "../../src/server/services/CampusUserService";

async function runMigration() {
	const prisma = new PrismaClient();
	const userService = new CampusUserService(prisma);
	const migrationService = new CampusMigrationService(prisma, userService);

	try {
		console.log('Starting campus migration...');

		// Get all active campuses
		const campuses = await prisma.campus.findMany({
			where: { status: 'ACTIVE' }
		});

		for (const campus of campuses) {
			console.log(`Migrating campus: ${campus.name}`);

			// Step 1: Migrate classes
			const classResult = await migrationService.migrateClassesToCampus(campus.id);
			console.log(`Migrated ${classResult.migratedCount} classes`);

			// Step 2: Migrate user associations
			const userResult = await migrationService.migrateUserAssociations(campus.id);
			console.log(`Migrated ${userResult.teacherCount} teachers and ${userResult.studentCount} students`);

			// Step 3: Deploy features
			await migrationService.deployFeatures(campus.id);
			console.log('Deployed core features');

			// Step 4: Enable initial features
			const initialFeatures = ['ATTENDANCE', 'GRADEBOOK', 'CLASS_MANAGEMENT', 'USER_MANAGEMENT'];
			for (const feature of initialFeatures) {
				await migrationService.enableFeature(campus.id, feature);
			}
			console.log('Enabled initial features');
		}

		console.log('Campus migration completed successfully');
	} catch (error) {
		console.error('Migration failed:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run migration
runMigration()
	.catch(console.error)
	.finally(() => process.exit());