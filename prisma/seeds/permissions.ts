import { PrismaClient } from '@prisma/client';
import { Permissions, DefaultRoles, RolePermissions } from '../../src/utils/permissions';

export async function seedPermissions(prisma: PrismaClient) {
	console.log('Seeding permissions and roles...');

	// Create all permissions
	const permissions = await Promise.all(
		Object.values(Permissions).map(async (permissionName) => {
			return prisma.permission.upsert({
				where: { name: permissionName },
				update: {},
				create: {
					name: permissionName,
					description: `Permission to ${permissionName.toLowerCase().replace(':', ' ')}`
				}
			});
		})
	);

	// Create roles
	const roles = await Promise.all([
		// Super Admin Role
		prisma.role.upsert({
			where: { name: DefaultRoles.SUPER_ADMIN },
			update: {
				description: 'Super Administrator with full access',
				permissions: {
					deleteMany: {},
					create: permissions.map(permission => ({
						permission: { connect: { id: permission.id } }
					}))
				}
			},
			create: {
				name: DefaultRoles.SUPER_ADMIN,
				description: 'Super Administrator with full access',
				permissions: {
					create: permissions.map(permission => ({
						permission: { connect: { id: permission.id } }
					}))
				}
			}
		}),
		// Admin Role
		prisma.role.upsert({
			where: { name: DefaultRoles.ADMIN },
			update: {
				description: 'Institution Administrator'
			},
			create: {
				name: DefaultRoles.ADMIN,
				description: 'Institution Administrator'
			}
		}),
		// Campus Admin Role
		prisma.role.upsert({
			where: { name: DefaultRoles.CAMPUS_ADMIN },
			update: {
				description: 'Campus Administrator',
				permissions: {
					deleteMany: {},
					create: permissions
						.filter(permission => 
							RolePermissions[DefaultRoles.CAMPUS_ADMIN].includes(permission.name as any)
						)
						.map(permission => ({
							permission: { connect: { id: permission.id } }
						}))
				}
			},
			create: {
				name: DefaultRoles.CAMPUS_ADMIN,
				description: 'Campus Administrator',
				permissions: {
					create: permissions
						.filter(permission => 
							RolePermissions[DefaultRoles.CAMPUS_ADMIN].includes(permission.name as any)
						)
						.map(permission => ({
							permission: { connect: { id: permission.id } }
						}))
				}
			}
		}),
		// Coordinator Role
		prisma.role.upsert({
			where: { name: DefaultRoles.COORDINATOR },
			update: {
				description: 'Academic Coordinator'
			},
			create: {
				name: DefaultRoles.COORDINATOR,
				description: 'Academic Coordinator'
			}
		}),
		// Teacher Role
		prisma.role.upsert({
			where: { name: DefaultRoles.TEACHER },
			update: {
				description: 'Teacher'
			},
			create: {
				name: DefaultRoles.TEACHER,
				description: 'Teacher'
			}
		}),
		// Student Role
		prisma.role.upsert({
			where: { name: DefaultRoles.STUDENT },
			update: {
				description: 'Student'
			},
			create: {
				name: DefaultRoles.STUDENT,
				description: 'Student'
			}
		}),
		// Parent Role
		prisma.role.upsert({
			where: { name: DefaultRoles.PARENT },
			update: {
				description: 'Parent'
			},
			create: {
				name: DefaultRoles.PARENT,
				description: 'Parent'
			}
		})
	]);

	// Assign permissions to roles based on RolePermissions mapping
	for (const role of roles) {
		const rolePermissions = RolePermissions[role.name as keyof typeof RolePermissions] || [];
		await Promise.all(
			rolePermissions.map(async permissionName => {
				const permission = permissions.find(p => p.name === permissionName);
				if (!permission) return Promise.resolve();

				// For global permissions, we first try to find if the permission already exists
				const existingPermission = await prisma.rolePermission.findFirst({
					where: {
						roleId: role.id,
						permissionId: permission.id,
						campusId: null
					}
				});

				// If it doesn't exist, create it
				if (!existingPermission) {
					return prisma.rolePermission.create({
						data: {
							role: { connect: { id: role.id } },
							permission: { connect: { id: permission.id } },
						}
					});
				}

				return existingPermission;
			})
		);
	}

	console.log('Permissions and roles seeded successfully');
	return { permissions, roles };
}
