import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const buildings = [
	{
		name: 'Main Academic Block',
		code: 'MAB',
		floors: [
			{
				number: 1,
				wings: [
					{
						name: 'A Wing',
						rooms: [
							{ number: '101', type: 'CLASSROOM', capacity: 40, status: 'ACTIVE', resources: { equipment: ['Projector', 'Whiteboard'] } },
							{ number: '102', type: 'LAB', capacity: 30, status: 'ACTIVE', resources: { equipment: ['Computers', 'Lab Equipment'] } },
							{ number: '103', type: 'CLASSROOM', capacity: 45, status: 'ACTIVE', resources: { equipment: ['Smart Board'] } },
						],
					},
					{
						name: 'B Wing',
						rooms: [
							{ number: '104', type: 'LECTURE_HALL', capacity: 100, status: 'ACTIVE', resources: { equipment: ['Audio System', 'Projector'] } },
							{ number: '105', type: 'ACTIVITY_ROOM', capacity: 50, status: 'ACTIVE', resources: { equipment: ['Activity Equipment'] } },
						],
					},
				],
			},
			{
				number: 2,
				wings: [
					{
						name: 'A Wing',
						rooms: [
							{ number: '201', type: 'CLASSROOM', capacity: 40, status: 'ACTIVE', resources: { equipment: ['Projector'] } },
							{ number: '202', type: 'LAB', capacity: 30, status: 'ACTIVE', resources: { equipment: ['Lab Equipment'] } },
						],
					},
					{
						name: 'B Wing',
						rooms: [
							{ number: '203', type: 'LECTURE_HALL', capacity: 80, status: 'ACTIVE', resources: { equipment: ['Multimedia System'] } },
							{ number: '204', type: 'CLASSROOM', capacity: 45, status: 'ACTIVE', resources: { equipment: ['Interactive Board'] } },
						],
					},
				],
			},
		],
	},
	{
		name: 'Science Block',
		code: 'SB',
		floors: [
			{
				number: 1,
				wings: [
					{
						name: 'Lab Wing',
						rooms: [
							{ number: 'L101', type: 'LAB', capacity: 30, status: 'ACTIVE', resources: { equipment: ['Chemistry Lab Equipment'] } },
							{ number: 'L102', type: 'LAB', capacity: 30, status: 'ACTIVE', resources: { equipment: ['Physics Lab Equipment'] } },
						],
					},
					{
						name: 'Research Wing',
						rooms: [
							{ number: 'R101', type: 'LAB', capacity: 20, status: 'ACTIVE', resources: { equipment: ['Research Equipment'] } },
							{ number: 'R102', type: 'ACTIVITY_ROOM', capacity: 25, status: 'ACTIVE', resources: { equipment: ['Research Tools'] } },
						],
					},
				],
			},
			{
				number: 2,
				wings: [
					{
						name: 'Advanced Lab Wing',
						rooms: [
							{ number: 'L201', type: 'LAB', capacity: 25, status: 'ACTIVE', resources: { equipment: ['Advanced Lab Equipment'] } },
							{ number: 'L202', type: 'LAB', capacity: 25, status: 'ACTIVE', resources: { equipment: ['Specialized Equipment'] } },
						],
					},
				],
			},
		],
	},
	{
		name: 'Library Block',
		code: 'LB',
		floors: [
			{
				number: 1,
				wings: [
					{
						name: 'Main Wing',
						rooms: [
							{ number: 'LIB101', type: 'ACTIVITY_ROOM', capacity: 100, status: 'ACTIVE', resources: { equipment: ['Library Shelves', 'Reading Tables'] } },
							{ number: 'LIB102', type: 'ACTIVITY_ROOM', capacity: 50, status: 'ACTIVE', resources: { equipment: ['Digital Resources'] } },
						],
					},
				],
			},
		],
	},
];

async function seedBuildings(campusId: string) {
	try {
		for (const building of buildings) {
			const createdBuilding = await prisma.building.upsert({
				where: { code: building.code },
				update: {},
				create: {
					name: building.name,
					code: building.code,
					campusId: campusId,
				},
			});

			// Create floors
			for (const floor of building.floors) {
				const createdFloor = await prisma.floor.create({
					data: {
						number: floor.number,
						buildingId: createdBuilding.id,
					},
				});

				// Create wings
				for (const wing of floor.wings) {
					const createdWing = await prisma.wing.create({
						data: {
							name: wing.name,
							floorId: createdFloor.id,
						},
					});

					// Create rooms
					for (const room of wing.rooms) {
						await prisma.room.create({
							data: {
								number: room.number,
								type: room.type as any,
								capacity: room.capacity,
								status: room.status as any,
								wingId: createdWing.id,
								resources: room.resources,
							},
						});
					}
				}
			}
		}

		console.log('Buildings, floors, wings, and rooms seeded successfully');
	} catch (error) {
		console.error('Error seeding buildings:', error);
		throw error;
	}
}

export { seedBuildings };