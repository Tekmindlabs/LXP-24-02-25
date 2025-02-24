import { PrismaClient } from '@prisma/client';
import { DefaultRoles } from '../../src/utils/permissions';

export async function seedCampusRoles(prisma: PrismaClient, campusId: string) {
	console.log('Creating demo campus roles...');

	// Find users and roles
	const superAdmin = await prisma.user.findUnique({ where: { email: 'superadmin@school.com' } });
	const adminUser = await prisma.user.findUnique({ where: { email: 'admin@school.com' } });
	const superAdminRole = await prisma.role.findUnique({ where: { name: DefaultRoles.SUPER_ADMIN } });
	const adminRole = await prisma.role.findUnique({ where: { name: DefaultRoles.ADMIN } });

	if (!superAdmin || !adminUser || !superAdminRole || !adminRole) {
		console.warn('Super Admin or Admin user/role not found. Ensure users and roles are seeded first.');
		return;
	}

	// Create Campus Roles
	await prisma.campusRole.upsert({
		where: { userId_campusId: { userId: superAdmin.id, campusId: campusId } },
		update: {},
		create: {
			userId: superAdmin.id,
			campusId: campusId,
			role: superAdminRole.name,
			permissions: [], // Permissions are managed at the role level
		},
	});

	await prisma.campusRole.upsert({
		where: { userId_campusId: { userId: adminUser.id, campusId: campusId } },
		update: {},
		create: {
			userId: adminUser.id,
			campusId: campusId,
			role: adminRole.name,
			permissions: [], // Permissions are managed at the role level
		},
	});

	console.log('Campus roles seeded successfully');
}