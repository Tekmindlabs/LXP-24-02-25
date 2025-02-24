import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { PrismaClient, Status, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { DefaultRoles } from "@/utils/permissions";
import { GradeBookService } from "../../services/GradeBookService";
import { AssessmentService } from "../../services/AssessmentService";

const createServices = (prisma: PrismaClient) => {
	const assessmentService = new AssessmentService(prisma);
	return new GradeBookService(prisma, assessmentService);
};

const classCreateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    classGroupId: z.string().min(1, "Class Group is required"), 
    campusId: z.string().min(1, "Campus is required"),
    buildingId: z.string().optional(),
    roomId: z.string().optional(),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    status: z.nativeEnum(Status),
    classTutorId: z.string().optional(),
    teacherIds: z.array(z.string()).optional(),
    description: z.string().optional(),
});



export const classRouter = createTRPCRouter({
	searchClasses: protectedProcedure
		.input(z.object({
			classGroupId: z.string().optional(),
			search: z.string().optional(),
			teacherId: z.string().optional(),
			status: z.nativeEnum(Status).optional(),
			campusId: z.string().optional(),
		}))
		.query(async ({ ctx, input }) => {
			try {
				const classes = await ctx.prisma.class.findMany({
					where: {
						status: input.status || Status.ACTIVE,
						...(input.search && {
							OR: [
								{ name: { contains: input.search, mode: 'insensitive' } },
							],
						}),
						...(input.classGroupId && { classGroupId: input.classGroupId }),
						...(input.teacherId && {
							teachers: {
								some: { teacherId: input.teacherId },
							},
						}),
						...(input.campusId && { campus: { id: input.campusId } }),
					},
					include: {
						classGroup: {
							include: {
								program: true,
							},
						},
						campus: true,
						building: true,
						room: true,
						teachers: {
							include: {
								teacher: {
									include: {
										user: true,
									},
								},
							},
						},
						students: {
							include: {
								user: true,
							},
						},
					},
					orderBy: {
						name: 'asc',
					},
				});
				return classes;
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch classes',
					cause: error,
				});
			}
		}),


	createClass: protectedProcedure
		.input(classCreateSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const teacherProfiles = await ctx.prisma.teacherProfile.findMany({
					where: {
						userId: {
							in: [...(input.teacherIds || []), input.classTutorId].filter(Boolean)
						}
					}
				});

				const data: Prisma.ClassCreateInput = {
					name: input.name,
					classGroup: { connect: { id: input.classGroupId } },
					campus: { connect: { id: input.campusId } },
					...(input.buildingId && { building: { connect: { id: input.buildingId } } }),
					...(input.roomId && { room: { connect: { id: input.roomId } } }),
					capacity: input.capacity,
					status: input.status,
					description: input.description,
					teachers: {
						createMany: {
							data: teacherProfiles.map(profile => ({
								teacherId: profile.id,
								isClassTeacher: profile.userId === input.classTutorId,
								status: Status.ACTIVE,
							}))
						}
					}
				};

				return ctx.prisma.class.create({
					data,
					include: {
						classGroup: true,
						campus: true,
						building: true,
						room: true,
						teachers: {
							include: {
								teacher: {
									include: {
										user: true
									}
								}
							}
						}
					}
				});
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create class',
					cause: error,
				});
			}
		}),





	updateClass: protectedProcedure
		.input(z.object({
			id: z.string(),
			data: classCreateSchema
		}))
		.mutation(async ({ ctx, input: { id, data } }) => {
			try {
				const { campusId, buildingId, roomId, ...restData } = data;
				
				return ctx.prisma.class.update({
					where: { id },
					data: {
						...restData,
						classGroup: { connect: { id: data.classGroupId } },
						...(campusId && { campus: { connect: { id: campusId } } }),
						...(buildingId && { building: { connect: { id: buildingId } } }),
						...(roomId && { room: { connect: { id: roomId } } }),
					},
					include: {
						classGroup: true,
						campus: true,
						building: true,
						room: true,
						teachers: {
							include: {
								teacher: {
									include: {
										user: true
									}
								}
							}
						}
					}
				});
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update class',
					cause: error,
				});
			}
		}),


	deleteClass: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.class.delete({
				where: { id: input },
			});
		}),

	getClass: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			return ctx.prisma.class.findUnique({
				where: { id: input },
				include: {
					classGroup: {
						include: {
							program: true,
						},
					},
					teachers: {
						include: {
							teacher: {
								include: {
									user: true,
								},
							},
						},
					},
					students: true,
					classActivities: true,
					unifiedActivities: true,
					timetables: {
						include: {
							periods: true,
						},
					},
				},
			});
		}),






	getClassDetails: protectedProcedure
		.input(z.object({
			id: z.string(),
		}))
		.query(async ({ ctx, input }) => {
			const classDetails = await ctx.prisma.class.findUnique({
				where: { id: input.id },
				include: {
					classGroup: {
						include: {
							program: true,
							calendar: {
								include: {
									events: true
								}
							}
						},
					},
					teachers: {
						include: {
							teacher: {
								include: {
									user: true,
								},
							},
						},
					},
					students: {
						include: {
							user: true,
						},
					},
					classActivities: {
						include: {
							submissions: true,
						},
					},
					unifiedActivities: true,
					timetables: {
						include: {
							periods: true,
						},
					},
				},
			});

			if (!classDetails) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Class not found',
				});
			}

			return classDetails;
		}),


	list: protectedProcedure
		.query(async ({ ctx }) => {
			if (!ctx.session) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'You must be logged in to access this resource'
				});
			}

			try {
				console.log('List Classes - Session:', ctx.session);
				return ctx.prisma.class.findMany({
					include: {
						classGroup: true,
						campus: true,
						building: true,
						room: true,
						teachers: {
							include: {
								teacher: {
									include: {
										user: true
									}
								}
							}
						}
					}
				});
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to list classes',
					cause: error,
				});
			}
		}),

	getById: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			return ctx.prisma.class.findUnique({
				where: { id: input },
				include: {
					classGroup: true,
					students: true,
					teachers: {
						include: {
							teacher: {
								include: {
									user: true,
								},
							},
						},
					},
					timetables: {
						include: {
							periods: {
								include: {
									subject: true,
									classroom: true,
									teacher: {
										include: {
											user: true,
										},
									},
								},
							},
						},
					},
					classActivities: {
						include: {
							submissions: true,
						},
					},
					unifiedActivities: true,
				},
			});
		}),

	search: protectedProcedure
		.input(z.object({
			search: z.string().optional(),
			status: z.enum([Status.ACTIVE, Status.INACTIVE, Status.ARCHIVED]).optional(),
			classGroupId: z.string().optional(),
			teachers: z.object({
				some: z.object({
					teacherId: z.string(),
				}),
			}).optional(),
		}))
		.query(({ ctx, input }) => {
			const { search, ...filters } = input;
			return ctx.prisma.class.findMany({
				where: {
					...filters,
					...(search && {
						OR: [
							{ name: { contains: search, mode: 'insensitive' } },
						],
					}),
				},
				include: {
					classGroup: true,
					timetables: {
						include: {
							periods: {
								include: {
									subject: true,
									classroom: true,
									teacher: {
										include: {
											user: true,
										},
									},
								},
							},
						},
					},
				},
			});
		}),

	getTeacherClasses: protectedProcedure
		.query(async ({ ctx }) => {
			const userId = ctx.session?.user?.id;
			if (!userId) return [];

			return ctx.prisma.class.findMany({
				where: {
					teachers: {
						some: {
							teacher: {
								userId: userId
							}
						}
					}
				},
				include: {
					classGroup: true,
					teachers: {
						include: {
							teacher: {
								include: {
									user: true
								}
							}
						}
					}
				}
			});
		}),

	getStudents: protectedProcedure
		.input(z.object({
			classId: z.string()
		}))
		.query(async ({ ctx, input }) => {
			return ctx.prisma.studentProfile.findMany({
				where: {
					classId: input.classId
				},
				include: {
					user: true
				}
			});
		}),

	getHistoricalAnalytics: protectedProcedure
		.input(z.object({
			id: z.string(),
			startDate: z.date(),
			endDate: z.date()
		}))
		.query(async ({ ctx, input }) => {
			const { id, startDate, endDate } = input;

			// Get historical student counts
			const historicalStudents = await ctx.prisma.studentProfile.findMany({
				where: {
					classId: id,
					createdAt: {
						gte: startDate,
						lte: endDate
					}
				}
			});

			// Calculate growth percentage
			const studentGrowth = historicalStudents.length > 1 
				? ((historicalStudents[historicalStudents.length - 1].id ? 1 : 0) - 
				   (historicalStudents[0].id ? 1 : 0)) / 
				  (historicalStudents[0].id ? 1 : 1) * 100
				: 0;

			return {
				studentGrowth,
				historicalData: historicalStudents
			};
		}),

	getPerformanceTrends: protectedProcedure
		.input(z.object({
			id: z.string(),
			startDate: z.date(),
			endDate: z.date()
		}))
		.query(async ({ ctx, input }) => {
			const { id, startDate, endDate } = input;

			// Get all activities and submissions for the class
			const activities = await ctx.prisma.classActivity.findMany({
				where: {
					classId: id,
					createdAt: {
						gte: startDate,
						lte: endDate
					}
				},
				include: {
					submissions: true,
					subject: true
				}
			});

			// Calculate average scores by date
			const performanceData = activities.map(activity => ({
				date: activity.createdAt.toISOString().split('T')[0],
				averageScore: activity.submissions.reduce((acc: number, sub: any) => 
					acc + ((sub.obtainedMarks || 0) / (sub.totalMarks || 1) * 100), 0) / 
					(activity.submissions.length || 1)
			}));

			// Calculate subject-wise performance
			const subjectWise = activities.reduce((acc, activity) => {
				const subjectName = activity.subject.name;
				if (!acc[subjectName]) {
					acc[subjectName] = {
						subject: subjectName,
						totalScore: 0,
						count: 0
					};
				}
				
				const avgScore = activity.submissions.reduce((sum: number, sub: any) => 
					sum + ((sub.obtainedMarks || 0) / (sub.totalMarks || 1) * 100), 0) / 
					(activity.submissions.length || 1);
				
				acc[subjectName].totalScore += avgScore;
				acc[subjectName].count += 1;
				return acc;
			}, {} as Record<string, { subject: string; totalScore: number; count: number; }>);

			const subjectPerformance = Object.values(subjectWise).map(data => ({
				subject: data.subject,
				averageScore: data.totalScore / data.count
			}));

			return {
				data: performanceData,
				subjectWise: subjectPerformance
			};
		}),

	getAttendanceStats: protectedProcedure
		.input(z.object({
			id: z.string(),
			startDate: z.date(),
			endDate: z.date()
		}))
		.query(async ({ ctx, input }) => {
			const { id, startDate, endDate } = input;

			// Get attendance records for the class
			const attendance = await ctx.prisma.attendance.findMany({
				where: {
					student: {
						classId: id
					},
					date: {
						gte: startDate,
						lte: endDate
					}
				}
			});

			// Calculate daily attendance rates
			const attendanceByDate = attendance.reduce((acc, record) => {
				const date = record.date.toISOString().split('T')[0];
				if (!acc[date]) {
					acc[date] = { present: 0, total: 0 };
				}
				acc[date].total += 1;
				if (record.status === 'PRESENT') {
					acc[date].present += 1;
				}
				return acc;
			}, {} as Record<string, { present: number; total: number; }>);

			const trends = Object.entries(attendanceByDate).map(([date, stats]) => ({
				date,
				attendanceRate: (stats.present / stats.total) * 100
			}));

			return {
				trends,
				averageAttendance: trends.length > 0 
					? trends.reduce((acc, day) => acc + day.attendanceRate, 0) / trends.length 
					: 0
			};
		}),

	getGradebook: protectedProcedure
		.input(z.object({
			classId: z.string(),
		}))
		.query(async ({ ctx, input }) => {
			try {
				const gradeBook = await ctx.prisma.gradeBook.findUnique({
					where: {
						classId: input.classId,
					},
					include: {
						assessmentSystem: true,
						termStructure: {
							include: {
								academicTerms: {
									include: {
										assessmentPeriods: true,
									},
								},
							},
						},
						subjectRecords: {
							include: {
								subject: true,
							},
						},
					},
				});

				if (!gradeBook) {
					// Try to initialize gradebook if it doesn't exist
					const gradeBookService = createServices(ctx.prisma);

					
					await gradeBookService.initializeGradeBook(input.classId);
					
					// Fetch the newly created gradebook
					const newGradeBook = await ctx.prisma.gradeBook.findUnique({
						where: {
							classId: input.classId,
						},
						include: {
							assessmentSystem: true,
							termStructure: {
								include: {
									academicTerms: {
										include: {
											assessmentPeriods: true,
										},
									},
								},
							},
							subjectRecords: {
								include: {
									subject: true,
								},
							},
						},
					});

					if (!newGradeBook) {
						throw new TRPCError({
							code: 'NOT_FOUND',
							message: 'Failed to initialize gradebook',
						});
					}

					return newGradeBook;
				}

				return gradeBook;
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch gradebook',
					cause: error,
				});
			}
		}),
});
