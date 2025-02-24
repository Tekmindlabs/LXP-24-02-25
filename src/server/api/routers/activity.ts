import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ActivityService } from '@/server/services/activity.service';
import { ActivityScope, ActivityStatus, ActivityType, ActivityMode, ActivityGradingType, ActivityViewType } from '@/types/class-activity';

import { prisma } from '@/server/db';

const activityService = new ActivityService(prisma);

const configurationSchema = z.object({
	activityMode: z.nativeEnum(ActivityMode),
	isGraded: z.boolean(),
	totalMarks: z.number().min(0),
	passingMarks: z.number().min(0),
	gradingType: z.nativeEnum(ActivityGradingType),
	availabilityDate: z.date(),
	deadline: z.date(),
	viewType: z.nativeEnum(ActivityViewType)
}).required();

export const activityRouter = createTRPCRouter({
	getAll: protectedProcedure
		.input(z.object({
			subjectId: z.string().optional(),
			classId: z.string().optional(),
			curriculumNodeId: z.string().optional(),
			scope: z.nativeEnum(ActivityScope).optional(),
			isTemplate: z.boolean().optional()
		}))
		.query(async ({ input }) => {
			return activityService.getActivities(input);
		}),

	create: protectedProcedure
		.input(z.object({
			title: z.string(),
			description: z.string().optional(),
			type: z.nativeEnum(ActivityType),
			scope: z.nativeEnum(ActivityScope),
			subjectId: z.string(),
			classId: z.string().optional(),
			curriculumNodeId: z.string().optional(),
			isTemplate: z.boolean().optional(),
			configuration: configurationSchema,
			resources: z.array(z.any()).optional()
		}))
		.mutation(async ({ input }) => {
			return activityService.createActivity(input);
		}),

	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			title: z.string().optional(),
			description: z.string().optional(),
			type: z.nativeEnum(ActivityType).optional(),
			status: z.nativeEnum(ActivityStatus).optional(),
			configuration: configurationSchema.optional(),
			resources: z.array(z.any()).optional()
		}))
		.mutation(async ({ input }) => {
			const { id, ...data } = input;
			return activityService.updateActivity(id, data);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			return activityService.deleteActivity(input.id);
		}),

	cloneTemplate: protectedProcedure
		.input(z.object({
			templateId: z.string(),
			classId: z.string()
		}))
		.mutation(async ({ input }) => {
			return activityService.cloneTemplate(
				input.templateId,
				input.classId
			);
		})
});