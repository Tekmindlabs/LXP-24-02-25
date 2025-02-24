import { PrismaClient, Status } from '@prisma/client';

export async function seedBuildings(prisma: PrismaClient, campusId: string) {
	console.log('Creating demo buildings...');

	const buildingsData = [
		{
			name: 'Main Academic Block',
			code: 'MAB',
			description: 'Main academic building with classrooms and labs'
		},
		{
			name: 'Science Block',
			code: 'SB',
			description: 'Science laboratories and research facilities'
		},
		{
			name: 'Library Block',
			code: 'LB',
			description: 'Central library and study areas'
		}
	];

	const buildings = await Promise.all(
		buildingsData.map(building =>
			prisma.building.upsert({
				where: { code: building.code },
				update: {},
				create: {
					name: building.name,
					code: building.code,
					campusId: campusId,
				},
			})
		)
	);

	console.log('Buildings seeded successfully');
	return buildings;
}