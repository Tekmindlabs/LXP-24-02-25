import { PrismaClient } from '@prisma/client';
import { seedPermissions } from './permissions';
import { seedUsers } from './users';
import { seedCampus } from './campus';
import { seedAcademicYear } from './academic-year';
import { seedCalendar } from './calendar';
import { seedPrograms } from './programs';
import { seedClassGroups } from './class-groups';
import { seedSubjects } from './subjects';
import { seedClasses } from './classes';
import { seedClassrooms } from './classrooms';
import { seedTimetables } from './timetables';
import { seedActivities } from './activities';
import { seedAttendance } from './attendance';
import { seedBuildings } from './buildings';
import { seedCampusRoles } from './campus-roles';

const prisma = new PrismaClient();

async function seedDemoData() {
	try {
		console.log('Starting demo data seeding...');
		
		// Seed permissions and roles first
		await seedPermissions(prisma);
		
		// Create users and roles
		await seedUsers(prisma);

		// Create main campus
		const campus = await seedCampus(prisma);

		// Seed buildings for the campus
		await seedBuildings(prisma, campus.id);

		// Seed campus roles
		await seedCampusRoles(prisma, campus.id);
		
		// Create academic year
		const academicYear = await seedAcademicYear(prisma);
		
		// Create calendar and events
		const calendar = await seedCalendar(prisma, academicYear.id);
		
		// Create programs
		const programs = await seedPrograms(prisma, calendar.id);
		
		// Create class groups
		const classGroups = await seedClassGroups(prisma, programs);
		
		// Create subjects
		const subjects = await seedSubjects(prisma, classGroups);
		
		// Create classes with campus
		const classes = await seedClasses(prisma, classGroups, campus.id);
		
		// Seed attendance data after classes are created
		await seedAttendance(prisma);
		
		// Create classrooms
		const classrooms = await seedClassrooms(prisma);
		
		// Create timetables and periods
		await seedTimetables(prisma, { classGroups, classes, subjects, classrooms });
		
		// Create activities and resources
		await seedActivities(prisma, { classes, subjects, classGroups });

		console.log('Demo data seeding completed successfully');
	} catch (error) {
		console.error('Error seeding demo data:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

seedDemoData()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});