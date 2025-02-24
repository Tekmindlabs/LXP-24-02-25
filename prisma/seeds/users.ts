import { PrismaClient, UserType, Status, User, Campus } from '@prisma/client';
import { DefaultRoles } from '../../src/utils/permissions';
import bcrypt from 'bcryptjs';
import { seedCampus } from './campus';

interface SeedUsersResult {
	users: User[];
	campus: Campus | null;
}

export async function seedUsers(prisma: PrismaClient): Promise<SeedUsersResult> {
	console.log('Creating demo users...');

	// Seed campus first
	const campus = await seedCampus(prisma);
	if (!campus) {
		console.error("Failed to seed campus. Aborting user seeding.");
		return { users: [], campus: null };
	}

	// Get roles
	const roles = await Promise.all(
		Object.values(DefaultRoles).map(roleName =>
			prisma.role.findUnique({ where: { name: roleName } })
		)
	);

	// Create users with profiles
	let users: (User | null)[] = [];
	// Super Admin User
	const superAdminPassword = await bcrypt.hash('superadmin123', 12);
	users.push(
		await prisma.user.upsert({
			where: { email: 'superadmin@school.com' },
			update: {
				userRoles: {
					deleteMany: {},
					create: {
						roleId: (await roles.find(r => r?.name === DefaultRoles.SUPER_ADMIN))?.id || ''
					}
				}
			},
			create: {
				name: 'Super Admin',
				email: 'superadmin@school.com',
				password: superAdminPassword,
				userType: UserType.ADMIN,
				status: Status.ACTIVE,
				phoneNumber: '+1234567889',
				emailVerified: new Date(),
				userRoles: {
					create: {
						roleId: roles.find(r => r?.name === DefaultRoles.SUPER_ADMIN)?.id || ''
					}
				},
				notificationSettings: {
					create: {
						emailNotifications: true,
						pushNotifications: true,
						timetableChanges: true,
						assignmentUpdates: true,
						gradeUpdates: true,
						systemUpdates: true
					}
				}
			}
		})
	);
	// Campus Admin User
	const campusAdminPassword = await bcrypt.hash('campusadmin123', 12);
	const campusAdminUser = await prisma.user.upsert({
		where: { email: 'campusadmin@school.com' },
		update: {},
		create: {
			name: 'Campus Admin',
			email: 'campusadmin@school.com',
			password: campusAdminPassword,
			userType: UserType.ADMIN,
			status: Status.ACTIVE,
			phoneNumber: '+1234567888',
			emailVerified: new Date(),
			userRoles: {
				create: {
					roleId: roles.find(r => r?.name === DefaultRoles.ADMIN)?.id || ''
				}
			},
			notificationSettings: {
				create: {
					emailNotifications: true,
					pushNotifications: true,
					timetableChanges: true,
					assignmentUpdates: true,
					gradeUpdates: true,
					systemUpdates: true
				}
			}
		}
	});
	users.push(campusAdminUser);


	// Admin Users
	const adminPassword = await bcrypt.hash('admin123', 12);
	users.push(
		await prisma.user.upsert({
			where: { email: 'admin@school.com' },
			update: {},
			create: {
				name: 'Admin User',
				email: 'admin@school.com',
				password: adminPassword,
				userType: UserType.ADMIN,
				status: Status.ACTIVE,
				phoneNumber: '+1234567890',
				emailVerified: new Date(),
				userRoles: {
					create: {
						roleId: roles.find(r => r?.name === DefaultRoles.ADMIN)?.id || ''
					}
				},
				notificationSettings: {
					create: {
						emailNotifications: true,
						pushNotifications: true,
						timetableChanges: true,
						assignmentUpdates: true,
						gradeUpdates: true,
						systemUpdates: true
					}
				}
			}
		})
	);

	// Teachers
	const teacherPassword = await bcrypt.hash('teacher123', 12);
	const teachers = [
		{
			name: 'John Smith',
			email: 'john.smith@school.com',
			specialization: 'Mathematics',
			phoneNumber: '+1234567891'
		},
		{
			name: 'Sarah Johnson',
			email: 'sarah.johnson@school.com',
			specialization: 'Science',
			phoneNumber: '+1234567892'
		}
	];

	const createdTeachers = await Promise.all(teachers.map(async (teacher) => {
		const teacherUser = await prisma.user.upsert({

				where: { email: teacher.email },
				update: {},
				create: {
					name: teacher.name,
					email: teacher.email,
					password: teacherPassword,
					userType: UserType.TEACHER,
					status: Status.ACTIVE,
					phoneNumber: teacher.phoneNumber,
					emailVerified: new Date(),
					userRoles: {
						create: {
							roleId: roles.find(r => r?.name === DefaultRoles.TEACHER)?.id || ''
						}
					},
					teacherProfile: {
						create: {
							specialization: teacher.specialization,
							teacherType: 'SUBJECT'
						}
					},
					notificationSettings: {
						create: {
							emailNotifications: true,
							pushNotifications: true,
							timetableChanges: true,
							assignmentUpdates: true,
							gradeUpdates: true,
							systemUpdates: true
						}
					}
				}
			});
		return teacherUser;
	}));
	users.push(...createdTeachers);

	// Students
	const studentPassword = await bcrypt.hash('student123', 12);
	const students = [
		{
			name: 'Alice Brown',
			email: 'alice.brown@school.com',
			dateOfBirth: new Date('2010-03-15'),
			phoneNumber: '+1234567893'
		},
		{
			name: 'Bob Wilson',
			email: 'bob.wilson@school.com',
			dateOfBirth: new Date('2010-05-20'),
			phoneNumber: '+1234567894'
		}
	];

	const createdStudents = await Promise.all(students.map(async (student) => {
		const studentUser = await prisma.user.upsert({

				where: { email: student.email },
				update: {},
				create: {
					name: student.name,
					email: student.email,
					password: studentPassword,
					userType: UserType.STUDENT,
					status: Status.ACTIVE,
					phoneNumber: student.phoneNumber,
					dateOfBirth: student.dateOfBirth,
					emailVerified: new Date(),
					userRoles: {
						create: {
							roleId: roles.find(r => r?.name === DefaultRoles.STUDENT)?.id || ''
						}
					},
					studentProfile: {
						create: {
							dateOfBirth: student.dateOfBirth
						}
					},
					notificationSettings: {
						create: {
							emailNotifications: true,
							pushNotifications: true,
							timetableChanges: true,
							assignmentUpdates: true,
							gradeUpdates: true,
							systemUpdates: true
						}
					}
				}
			});
		return studentUser;
	}));
	users.push(...createdStudents);

	// Parents
	const parentPassword = await bcrypt.hash('parent123', 12);
	const parents = [
		{
			name: 'Mary Brown',
			email: 'mary.brown@example.com',
			phoneNumber: '+1234567895',
			childEmail: 'alice.brown@school.com'
		},
		{
			name: 'James Wilson',
			email: 'james.wilson@example.com',
			phoneNumber: '+1234567896',
			childEmail: 'bob.wilson@school.com'
		}
	];

	const createdParents = await Promise.all(parents.map(async (parent) => {
		const child = await prisma.studentProfile.findFirst({
			where: {
				user: {
					email: parent.childEmail
				}
			}
		});

		if (child) {
			const parentUser = await prisma.user.upsert({

					where: { email: parent.email },
					update: {},
					create: {
						name: parent.name,
						email: parent.email,
						password: parentPassword,
						userType: UserType.PARENT,
						status: Status.ACTIVE,
						phoneNumber: parent.phoneNumber,
						emailVerified: new Date(),
						userRoles: {
							create: {
								roleId: roles.find(r => r?.name === DefaultRoles.PARENT)?.id || ''
							}
						},
						parentProfile: {
							create: {
								children: {
									connect: {
										id: child.id
									}
								}
							}
						},
						notificationSettings: {
							create: {
								emailNotifications: true,
								pushNotifications: true,
								timetableChanges: true,
								assignmentUpdates: true,
								gradeUpdates: true,
								systemUpdates: true
							}
						}
					}
				});
			return parentUser;
		}
		return null;
	}));
	// Filter out null values from all user arrays before returning
	const validUsers = [
		...users.filter((user): user is User => user !== null),
		...createdTeachers.filter((user): user is User => user !== null),
		...createdStudents.filter((user): user is User => user !== null),
		...createdParents.filter((user): user is User => user !== null)
	];

	console.log('Users seeded successfully');
	return { users: validUsers, campus };
}
