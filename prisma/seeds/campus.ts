import { PrismaClient, CampusType, Status } from '@prisma/client';

export async function seedCampus(prisma: PrismaClient) {
	console.log('Creating demo campus...');

	const campus = await prisma.campus.upsert({
		where: { code: 'MAIN' },
		update: {},
		create: {
			name: 'Main Campus',
			code: 'MAIN',
			establishmentDate: new Date('2024-01-01'),
			type: CampusType.MAIN,
			status: Status.ACTIVE,
			streetAddress: '123 Education Street',
			city: 'Education City',
			state: 'Education State',
			country: 'Education Country',
			postalCode: '12345',
			primaryPhone: '+1234567890',
			email: 'main@campus.edu',
			emergencyContact: '+1234567899',
			gpsCoordinates: '12.9716° N, 77.5946° E',
			secondaryPhone: '+1234567891',
		},
	});

	console.log('Campus seeded successfully');
	return campus;
}