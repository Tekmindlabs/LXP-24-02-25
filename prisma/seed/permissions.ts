import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const permissions = [
	// Campus Management
	{ name: 'campus.view', description: 'View campus details' },
	{ name: 'campus.create', description: 'Create new campus' },
	{ name: 'campus.edit', description: 'Edit campus details' },
	{ name: 'campus.delete', description: 'Delete campus' },
	
	// Building Management
	{ name: 'building.view', description: 'View building details' },
	{ name: 'building.create', description: 'Create new building' },
	{ name: 'building.edit', description: 'Edit building details' },
	{ name: 'building.delete', description: 'Delete building' },
	
	// Floor & Wing Management
	{ name: 'floor.manage', description: 'Manage floor details' },
	{ name: 'wing.manage', description: 'Manage wing details' },
	
	// Room Management
	{ name: 'room.view', description: 'View room details' },
	{ name: 'room.create', description: 'Create new room' },
	{ name: 'room.edit', description: 'Edit room details' },
	{ name: 'room.delete', description: 'Delete room' },
	
	// User Management
	{ name: 'user.view', description: 'View user details' },
	{ name: 'user.create', description: 'Create new user' },
	{ name: 'user.edit', description: 'Edit user details' },
	{ name: 'user.delete', description: 'Delete user' },
	
	// Role Management
	{ name: 'role.manage', description: 'Manage roles and permissions' },

	// Academic Management
	{ name: 'program.manage', description: 'Manage academic programs' },
	{ name: 'curriculum.manage', description: 'Manage curriculum' },
	{ name: 'class.manage', description: 'Manage classes' },
	{ name: 'assessment.manage', description: 'Manage assessments' },
	
	// Teacher Management
	{ name: 'teacher.assign', description: 'Assign teachers to classes' },
	{ name: 'teacher.schedule', description: 'Manage teacher schedules' },
	
	// Student Management
	{ name: 'student.enroll', description: 'Enroll students' },
	{ name: 'student.attendance', description: 'Manage student attendance' },
	{ name: 'student.grades', description: 'Manage student grades' },
	
	// Institutional Settings
	{ name: 'settings.academic', description: 'Manage academic settings' },
	{ name: 'settings.system', description: 'Manage system settings' },
	{ name: 'settings.branding', description: 'Manage branding settings' }
];

const roles = [
	{
		name: 'SUPER_ADMIN',
		description: 'Super Administrator with full access',
		permissions: permissions.map(p => p.name),
	},
	{
		name: 'INSTITUTION_ADMIN',
		description: 'Institution Administrator',
		permissions: [
			'settings.academic', 'settings.system', 'settings.branding',
			'campus.view', 'campus.create', 'campus.edit',
			'program.manage', 'curriculum.manage',
			'user.view', 'user.create', 'user.edit',
			'role.manage'
		],
	},
	{
		name: 'CAMPUS_ADMIN',
		description: 'Campus Administrator',
		permissions: [
			'campus.view', 'campus.edit',
			'building.view', 'building.create', 'building.edit',
			'floor.manage', 'wing.manage',
			'room.view', 'room.create', 'room.edit',
			'user.view', 'user.create', 'user.edit',
			'teacher.assign', 'teacher.schedule',
			'student.enroll'
		],
	},
	{
		name: 'ACADEMIC_COORDINATOR',
		description: 'Academic Coordinator',
		permissions: [
			'program.manage', 'curriculum.manage', 'class.manage',
			'assessment.manage', 'teacher.assign', 'teacher.schedule',
			'student.grades', 'student.attendance'
		],
	},
	{
		name: 'FACILITY_MANAGER',
		description: 'Facility Manager',
		permissions: [
			'building.view', 'building.edit',
			'floor.manage', 'wing.manage',
			'room.view', 'room.edit'
		],
	},
	{
		name: 'TEACHER',
		description: 'Teacher',
		permissions: [
			'class.manage', 'student.attendance', 'student.grades',
			'room.view', 'assessment.manage'
		],
	}
];

async function seedPermissions() {
	try {
		// Create permissions
		for (const permission of permissions) {
			await prisma.permission.upsert({
				where: { name: permission.name },
				update: {},
				create: permission,
			});
		}

		// Create roles with permissions
		for (const role of roles) {
			const createdRole = await prisma.role.upsert({
				where: { name: role.name },
				update: {
					description: role.description,
				},
				create: {
					name: role.name,
					description: role.description,
				},
			});

			// Assign permissions to role
			for (const permissionName of role.permissions) {
				await prisma.rolePermission.upsert({
					where: {
						roleId_permissionId: {
							roleId: createdRole.id,
							permissionId: (await prisma.permission.findUnique({ where: { name: permissionName } }))!.id,
						},
					},
					update: {},
					create: {
						roleId: createdRole.id,
						permissionId: (await prisma.permission.findUnique({ where: { name: permissionName } }))!.id,
					},
				});
			}
		}

		console.log('Permissions and roles seeded successfully');
	} catch (error) {
		console.error('Error seeding permissions:', error);
		throw error;
	}
}

export { seedPermissions };