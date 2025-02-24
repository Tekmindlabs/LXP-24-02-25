import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Status, UserType, type Prisma } from "@prisma/client";
import * as XLSX from 'xlsx';
import { generatePassword } from "../../../utils/password";

interface WeeklyHours {
	dayName: string;
	totalHours: number;
}

interface ClassMetrics {
	classId: string;
	className: string;
	averageScore: number;
	totalStudents: number;
	completedAssignments: number;
}

// Excel row data interface
interface ExcelRow {
	Name: string;
	Email: string;
	PhoneNumber: string;
	TeacherType: string;
	Specialization?: string;
	SubjectIds?: string;
	ClassIds?: string;
}

// Schema for teacher data validation
const teacherDataSchema = z.object({
	name: z.string(),
	email: z.string().email(),
	phoneNumber: z.string(),
	teacherType: z.enum(['CLASS', 'SUBJECT']),
	specialization: z.string().optional(),
	subjectIds: z.array(z.string()).optional(),
	classIds: z.array(z.string()).optional(),
});

// Define TeacherType enum since it's not in Prisma client
export enum TeacherType {
	CLASS = 'CLASS',
	SUBJECT = 'SUBJECT'
}

export const teacherRouter = createTRPCRouter({
	createTeacher: protectedProcedure
		.input(z.object({
			name: z.string(),
			email: z.string().email(),
			phoneNumber: z.string().optional(),
			specialization: z.string().optional(),
			subjects: z.array(z.string()).optional(),
			teacherType: z.nativeEnum(TeacherType).optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const {
				name,
				email,
				phoneNumber,
				specialization,
				subjects,
				teacherType,
			} = input;

			const existingTeacher = await ctx.prisma.user.findFirst({
				where: {
					email,
					userType: UserType.TEACHER,
				},
			});

			if (existingTeacher) {
				throw new Error('Teacher with this email already exists');
			}

			const teacher = await ctx.prisma.user.create({
				data: {
					name,
					email,
					phoneNumber,
					userType: UserType.TEACHER,
					status: Status.ACTIVE,
					teacherProfile: {
						create: {
							specialization,
							teacherType: teacherType || TeacherType.SUBJECT,
							...(subjects && {
								subjects: {
									create: subjects.map((subjectId) => ({
										subject: {
											connect: { id: subjectId },
										},
										status: Status.ACTIVE,
									})),
								},
							}),
						},
					},
				},
				include: {
					teacherProfile: {
						include: {
							subjects: {
								include: {
									subject: true
								}
							}
						}
					}
				},
			});

			return teacher;
		}),

	updateTeacher: protectedProcedure
		.input(z.object({
			id: z.string(),
			name: z.string().optional(),
			email: z.string().email().optional(),
			phoneNumber: z.string().optional(),
			teacherType: z.nativeEnum(TeacherType).optional(),
			specialization: z.string().optional(),
			availability: z.string().optional(),
			subjectIds: z.array(z.string()).optional(),
			classIds: z.array(z.string()).optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const { id, subjectIds = [], classIds = [], teacherType, ...updateData } = input;

			const teacherProfile = await ctx.prisma.teacherProfile.findUnique({
				where: { userId: id },
			});

			if (!teacherProfile) {
				throw new Error("Teacher profile not found");
			}

			// Update teacher type if provided
			if (teacherType) {
				await ctx.prisma.teacherProfile.update({
					where: { id: teacherProfile.id },
					data: {
						teacherType,
					},
				});
			}

			// Handle subject assignments
			if (subjectIds.length > 0) {
				await ctx.prisma.teacherSubject.deleteMany({
					where: { teacherId: teacherProfile.id },
				});

				await ctx.prisma.teacherSubject.createMany({
					data: subjectIds.map(subjectId => ({
						teacherId: teacherProfile.id,
						subjectId,
						status: Status.ACTIVE,
					})),
				});
			}

			// Handle class assignments
			if (classIds.length > 0) {
				await ctx.prisma.teacherClass.deleteMany({
					where: { teacherId: teacherProfile.id },
				});

				await ctx.prisma.teacherClass.createMany({
					data: classIds.map(classId => ({
						teacherId: teacherProfile.id,
						classId,
						status: Status.ACTIVE,
						isClassTeacher: teacherType === TeacherType.CLASS,
					})),
				});
			}

			const userUpdateData: Prisma.UserUpdateInput = {
				...(updateData.name && { name: updateData.name }),
				...(updateData.email && { email: updateData.email }),
				...(updateData.phoneNumber && { phoneNumber: updateData.phoneNumber }),
				teacherProfile: {
					update: {
						...(updateData.specialization && { specialization: updateData.specialization }),
						...(updateData.availability && { availability: updateData.availability }),
					},
				},
			};

			const updatedTeacher = await ctx.prisma.user.update({
				where: { id },
				data: userUpdateData,
				include: {
					teacherProfile: {
						include: {
							subjects: {
								include: {
									subject: true
								}
							},
							classes: {
								include: {
									class: {
										include: {
											classGroup: true,
											students: true,
											teachers: {
												include: {
													teacher: true
												}
											}
										}
									}
								}
							}
						}
					}
				}
			});

			return updatedTeacher;
		}),

	deleteTeacher: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.user.delete({
				where: { id: input },
			});
		}),

	getById: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			try {
				const teacher = await ctx.prisma.user.findFirst({
					where: { 
						id: input,
						userType: UserType.TEACHER 
					},
					include: {
						teacherProfile: {
							include: {
								subjects: {
									include: {
										subject: true
									}
								},
								classes: {
									include: {
										class: {
											include: {
												classGroup: true,
												students: true,
												teachers: {
													include: {
														teacher: true
													}
												},
												timetables: {
													include: {
														periods: {
															include: {
																subject: true,
																classroom: true,
																teacher: true
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				});

				if (!teacher) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Teacher not found',
					});
				}

				return teacher;
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch teacher',
					cause: error,
				});
			}
		}),

	getTeacherClasses: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const teacherProfile = await ctx.prisma.teacherProfile.findFirst({
				where: {
					userId: input,
				},
				include: {
					classes: {
						where: {
							status: Status.ACTIVE,
						},
						include: {
							class: {
								include: {
									classGroup: true,
									students: true,
									teachers: {
										include: {
											teacher: true
										}
									},
									timetables: {
										include: {
											periods: {
												include: {
													subject: true,
													classroom: true,
													teacher: true
												}
											}
										}
									}
								}
							}
						}
					}
				}
			});

			if (!teacherProfile) {
				throw new Error("Teacher profile not found");
			}

			return teacherProfile.classes;
		}),

	assignClasses: protectedProcedure
		.input(z.object({
			teacherId: z.string(),
			classIds: z.array(z.string()),
			subjectIds: z.array(z.string())
		}))
		.mutation(async ({ ctx, input }) => {
			const { teacherId, classIds, subjectIds } = input;

			const teacherProfile = await ctx.prisma.teacherProfile.findUnique({
				where: { userId: teacherId },
				select: {
					id: true,
					teacherType: true,
				},
			});

			if (!teacherProfile) {
				throw new Error("Teacher profile not found");
			}

			// Clear existing assignments
			await ctx.prisma.teacherClass.deleteMany({
				where: { teacherId: teacherProfile.id },
			});
			await ctx.prisma.teacherSubject.deleteMany({
				where: { teacherId: teacherProfile.id },
			});

			// Create new class assignments
			if (classIds.length > 0) {
				await ctx.prisma.teacherClass.createMany({
					data: classIds.map(classId => ({
						teacherId: teacherProfile.id,
						classId,
						status: Status.ACTIVE,
						isClassTeacher: teacherProfile.teacherType === 'CLASS',
					})),
				});
			}

			// Create new subject assignments
			if (subjectIds.length > 0) {
				await ctx.prisma.teacherSubject.createMany({
					data: subjectIds.map(subjectId => ({
						teacherId: teacherProfile.id,
						subjectId,
						status: Status.ACTIVE,
					})),
				});
			}

			return ctx.prisma.user.findUnique({
				where: { id: teacherId },
				include: {
					teacherProfile: {
						include: {
							subjects: { include: { subject: true } },
							classes: {
								include: {
									class: {
										include: {
											classGroup: true,
											timetables: {
												include: {
													periods: {
														include: {
															subject: true,
															classroom: true,
															teacher: true
														}
													}
												}
											},
											students: true,
											teachers: {
												include: {
													teacher: true
												}
											}
										},
									},
								},
							}
						}
					}
				}
			});
		}),

	bulkAssignClasses: protectedProcedure
		.input(
			z.object({
				teacherId: z.string(),
				classIds: z.array(z.string()),
				isClassTeacher: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { teacherId, classIds, isClassTeacher = false } = input;

			const teacherProfile = await ctx.prisma.teacherProfile.findUnique({
				where: { userId: teacherId },
			});

			if (!teacherProfile) {
				throw new Error("Teacher profile not found");
			}

			const existingAssignments = await ctx.prisma.teacherClass.findMany({
				where: {
					teacherId: teacherProfile.id,
					classId: {
						in: classIds,
					},
				},
			});

			const existingClassIds = existingAssignments.map(tc => tc.classId);
			const newClassIds = classIds.filter(id => !existingClassIds.includes(id));

			if (newClassIds.length === 0) {
				return { message: "No new classes to assign" };
			}

			await ctx.prisma.teacherClass.createMany({
				data: newClassIds.map(classId => ({
					teacherId: teacherProfile.id,
					classId,
					isClassTeacher,
					status: Status.ACTIVE,
				})),
			});

			const updatedTeacher = await ctx.prisma.teacherProfile.findUnique({
				where: { id: teacherProfile.id },
				include: {
					classes: {
						include: {
							class: {
								include: {
									classGroup: true,
									students: true,
									teachers: {
										include: {
											teacher: true
										}
									}
								}
							}
						}
					}
				}
			});

			return {
				message: `Successfully assigned ${newClassIds.length} new classes to teacher`,
				teacher: updatedTeacher
			};
		}),

	searchTeachers: protectedProcedure
		.input(z.object({
			search: z.string().optional(),
			status: z.nativeEnum(Status).optional(),
		}))
		.query(async ({ ctx, input }) => {
			const { search, status } = input;

			const teachers = await ctx.prisma.user.findMany({
				where: {
					userType: UserType.TEACHER,
					...(status && { status }),
					...(search && {
						OR: [
							{ name: { contains: search, mode: 'insensitive' } },
							{ email: { contains: search, mode: 'insensitive' } },
						],
					}),
				},
				include: {
					teacherProfile: {
						include: {
							subjects: {
								include: {
									subject: true,
								},
							},
							classes: {
								include: {
									class: {
										include: {
											classGroup: true,
										},
									},
								},
							},
						},
					},
				},
				orderBy: {
					name: 'asc',
				},
			});

			return teachers;
		}),

	createCredentials: protectedProcedure
		.input(z.object({
			teacherId: z.string(),
			password: z.string().min(6),
		}))
		.mutation(async ({ ctx, input }) => {
			const { teacherId, password } = input;
			
			const teacher = await ctx.prisma.user.findFirst({
				where: { 
					id: teacherId,
					userType: UserType.TEACHER 
				},
			});

			if (!teacher) {
				throw new Error("Teacher not found");
			}

			return ctx.prisma.user.update({
				where: { id: teacherId },
				data: {
					password: password, // Note: In production, ensure password is properly hashed
				},
			});
		}),

	bulkUpload: protectedProcedure
		.input(z.instanceof(FormData))
		.mutation(async ({ ctx, input }) => {
			const file = input.get("file") as File;
			if (!file) throw new Error("No file provided");

			const buffer = Buffer.from(await file.arrayBuffer());
			const workbook = XLSX.read(buffer);
			const worksheet = workbook.Sheets[workbook.SheetNames[0]];
			const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

			const results = [];
			const errors = [];

			for (const row of data) {
				try {
					const validatedData = teacherDataSchema.parse({
						name: row.Name,
						email: row.Email,
						phoneNumber: row.PhoneNumber,
						teacherType: row.TeacherType,
						specialization: row.Specialization,
						subjectIds: row.SubjectIds?.split(',').map(id => id.trim()),
						classIds: row.ClassIds?.split(',').map(id => id.trim()),
					});

					const existingTeacher = await ctx.prisma.user.findFirst({
						where: {
							email: validatedData.email,
							userType: UserType.TEACHER,
						},
					});

					if (existingTeacher) {
						errors.push(`Teacher with email ${validatedData.email} already exists`);
						continue;
					}

					const teacher = await ctx.prisma.user.create({
						data: {
							name: validatedData.name,
							email: validatedData.email,
							phoneNumber: validatedData.phoneNumber,
							userType: UserType.TEACHER,
							status: Status.ACTIVE,
							password: await generatePassword(),
							teacherProfile: {
								create: {
									specialization: validatedData.specialization,
									teacherType: validatedData.teacherType as TeacherType,
									...(validatedData.subjectIds && {
										subjects: {
											create: validatedData.subjectIds.map((subjectId) => ({
												subject: {
													connect: { id: subjectId },
												},
												status: Status.ACTIVE,
											})),
										},
									}),
									...(validatedData.classIds && {
										classes: {
											create: validatedData.classIds.map((classId) => ({
												class: {
													connect: { id: classId },
												},
												status: Status.ACTIVE,
												isClassTeacher: validatedData.teacherType === TeacherType.CLASS,
											})),
										},
									}),
								},
							},
						},
						include: {
							teacherProfile: {
								include: {
									subjects: {
										include: {
											subject: true,
										},
									},
									classes: {
										include: {
											class: {
												include: {
													classGroup: true,
													students: true,
													teachers: {
														include: {
															teacher: true
														}
													}
												}
											}
										}
									}
								}
							}
						},
					});

					results.push(teacher);
				} catch (error) {
					if (error instanceof Error) {
						errors.push(`Error processing row for ${row.Email}: ${error.message}`);
					} else {
						errors.push(`Error processing row for ${row.Email}: Unknown error`);
					}
				}
			}

			return {
				success: results.length > 0,
				teachersCreated: results.length,
				errors: errors.length > 0 ? errors : undefined,
			};
		}),

	getTeacherAnalytics: protectedProcedure
		.input(z.object({
			teacherId: z.string(),
			startDate: z.date().optional(),
			endDate: z.date().optional(),
		}))
		.query(async ({ ctx, input }) => {
			const teacherProfile = await ctx.prisma.teacherProfile.findFirst({
				where: { userId: input.teacherId },
				include: {
					subjects: {
						include: {
							subject: true,
						},
					},
					classes: {
						include: {
							class: {
								include: {
									students: true,
									classGroup: true,
									teachers: {
										include: {
											teacher: true
										}
									},
									timetables: {
										include: {
											periods: {
												where: {
													teacherId: input.teacherId,
												},
												include: {
													subject: true,
												},
											},
										},
									},
								},
							},
						},
					},
				},
			});

			if (!teacherProfile) {
				throw new Error("Teacher profile not found");
			}

			// Calculate hours per subject from timetable
			const subjectHours = new Map<string, number>();
			teacherProfile.classes.forEach(tc => {
				tc.class.timetables?.forEach(tt => {
					tt.periods?.forEach(period => {
						if (period.subject) {
							const current = subjectHours.get(period.subject.id) || 0;
							subjectHours.set(period.subject.id, current + 1);
						}
					});
				});
			});

			const subjects = teacherProfile.subjects.map(ts => ({
				id: ts.subject.id,
				name: ts.subject.name,
				hoursPerWeek: subjectHours.get(ts.subject.id) || 0,
			}));

			// Calculate analytics with proper null checks
			const analytics = {
				subjects,
				totalHoursPerWeek: Array.from(subjectHours.values()).reduce((a, b) => a + b, 0),
				classesCount: teacherProfile.classes.length,
				studentsCount: teacherProfile.classes.reduce((total, tc) => total + (tc.class?.students?.length ?? 0), 0),
				// Add any additional analytics based on startDate and endDate if provided
			};

			return analytics;
		}),
});