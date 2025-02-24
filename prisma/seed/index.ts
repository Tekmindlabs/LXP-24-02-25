import { PrismaClient } from '@prisma/client';
import { seedPermissions } from './permissions';
import { seedBuildings } from './buildings';

const prisma = new PrismaClient();

async function main() {
	try {
		// First seed permissions and roles
		await seedPermissions();

		// Create main campus
		const mainCampus = await prisma.campus.upsert({
			where: { code: 'MAIN' },
			update: {},
			create: {
				name: 'Main Campus',
				code: 'MAIN',
				establishmentDate: new Date('2024-01-01'),
				type: 'MAIN',
				streetAddress: '123 Education Street',
				city: 'Education City',
				state: 'Education State',
				country: 'Education Country',
				postalCode: '12345',
				primaryPhone: '+1234567890',
				email: 'main@campus.edu',
				emergencyContact: '+1234567899',
				status: 'ACTIVE',
				gpsCoordinates: '12.9716° N, 77.5946° E',
				secondaryPhone: '+1234567891',
			},
		});

		// Create branch campus
		const branchCampus = await prisma.campus.upsert({
			where: { code: 'BRANCH1' },
			update: {},
			create: {
				name: 'City Branch Campus',
				code: 'BRANCH1',
				establishmentDate: new Date('2024-02-01'),
				type: 'BRANCH',
				streetAddress: '456 Learning Avenue',
				city: 'Tech City',
				state: 'Tech State',
				country: 'Education Country',
				postalCode: '54321',
				primaryPhone: '+1234567892',
				email: 'branch@campus.edu',
				emergencyContact: '+1234567893',
				status: 'ACTIVE',
				gpsCoordinates: '13.0827° N, 77.5877° E',
			},
		});

		// Seed buildings for both campuses
		await seedBuildings(mainCampus.id);
		await seedBuildings(branchCampus.id);

		console.log('Seeding completed successfully');
	} catch (error) {
		console.error('Error during seeding:', error);
		throw error;
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});