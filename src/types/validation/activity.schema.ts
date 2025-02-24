import { z } from 'zod';
import { ActivityType, ActivityMode, ActivityGradingType, ActivityViewType, ActivityScope } from '../class-activity';

export const activityConfigurationSchema = z.object({
	activityMode: z.nativeEnum(ActivityMode),
	isGraded: z.boolean(),
	totalMarks: z.number().min(0),
	passingMarks: z.number().min(0),
	gradingType: z.nativeEnum(ActivityGradingType),
	availabilityDate: z.date(),
	deadline: z.date(),
	viewType: z.nativeEnum(ActivityViewType),
	instructions: z.string().optional(),
	timeLimit: z.number().min(0).optional(),
	attempts: z.number().min(1).optional(),
	autoGradingConfig: z.object({
		scorePerQuestion: z.number().min(0),
		penaltyPerWrongAnswer: z.number().min(0),
		allowPartialCredit: z.boolean()
	}).optional()
});

export const activitySchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().optional(),
	type: z.nativeEnum(ActivityType),
	subjectId: z.string().min(1),
	classId: z.string().optional(),
	curriculumNodeId: z.string().optional(),
	scope: z.nativeEnum(ActivityScope),
	isTemplate: z.boolean().optional(),
	configuration: activityConfigurationSchema,
	resources: z.array(z.object({
		title: z.string(),
		type: z.string(),
		url: z.string().url()
	})).optional()
});

export type ActivityFormData = z.infer<typeof activitySchema>;