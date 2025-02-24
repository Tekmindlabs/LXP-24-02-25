'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityScope, ActivityType, FormData, ActivityMode, ActivityGradingType, ActivityViewType } from '@/types/class-activity';
import { api } from '@/utils/api';

const activitySchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().optional(),
	type: z.nativeEnum(ActivityType),
	scope: z.nativeEnum(ActivityScope),
	subjectId: z.string(),
	classId: z.string().optional(),
	curriculumNodeId: z.string().optional(),
	isTemplate: z.boolean().optional(),
	configuration: z.object({
		activityMode: z.nativeEnum(ActivityMode),
		isGraded: z.boolean(),
		totalMarks: z.number().min(0),
		passingMarks: z.number().min(0),
		gradingType: z.nativeEnum(ActivityGradingType),
		availabilityDate: z.date(),
		deadline: z.date(),
		viewType: z.nativeEnum(ActivityViewType)
	})
});

interface ActivityFormProps {
	activityId?: string;
	subjectId: string;
	classId?: string;
	curriculumNodeId?: string;
	scope: ActivityScope;
	onClose: () => void;
}

export function ActivityForm({
	activityId,
	subjectId,
	classId,
	curriculumNodeId,
	scope,
	onClose
}: ActivityFormProps) {
	const form = useForm<FormData>({
		resolver: zodResolver(activitySchema),
		defaultValues: {
			title: '',
			description: '',
			type: ActivityType.QUIZ_MULTIPLE_CHOICE,
			scope,
			subjectId,
			classId,
			curriculumNodeId,
			isTemplate: scope === ActivityScope.CURRICULUM,
			configuration: {
				activityMode: ActivityMode.ONLINE,
				isGraded: false,
				totalMarks: 0,
				passingMarks: 0,
				gradingType: ActivityGradingType.AUTOMATIC,
				availabilityDate: new Date(),
				deadline: new Date(),
				viewType: ActivityViewType.PREVIEW
			}
		}
	});

	const { mutate: createActivity } = api.activity.create.useMutation({
		onSuccess: () => {
			onClose();
		}
	});

	const { mutate: updateActivity } = api.activity.update.useMutation({
		onSuccess: () => {
			onClose();
		}
	});

	const onSubmit = (data: FormData) => {
		if (activityId) {
			updateActivity({ id: activityId, ...data });
		} else {
			createActivity(data);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Title</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Activity Type</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									{Object.values(ActivityType).map((type) => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormItem>
					)}
				/>

				<div className="flex justify-end gap-2">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit">
						{activityId ? 'Update' : 'Create'} Activity
					</Button>
				</div>
			</form>
		</Form>
	);
}

export default ActivityForm;