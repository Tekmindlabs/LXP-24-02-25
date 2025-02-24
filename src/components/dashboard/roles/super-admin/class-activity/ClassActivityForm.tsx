'use client';

import { useForm, UseFormReturn } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { MultiSelect } from '@/components/ui/multi-select';

import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResourcesSection } from "./ResourcesSection";
import { api } from "@/utils/api";

import { 
	ActivityType, 
	ActivityMode, 
	ActivityGradingType,
	ActivityViewType,
	ActivityResourceType,
	ActivityConfiguration,
	ActivityResource
} from "@/types/class-activity";


type Resource = ActivityResource;




type FormData = z.infer<typeof formSchema>;







const formSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	type: z.nativeEnum(ActivityType),
	classId: z.string().optional(),
	subjectIds: z.array(z.string()),
	teacherAssignments: z.array(z.object({
		subjectId: z.string(),
		teacherId: z.string(),
	})),
	classGroupId: z.string().optional(),


	inheritCalendar: z.boolean().default(true),
	configuration: z.object({
		activityMode: z.nativeEnum(ActivityMode),
		isGraded: z.boolean(),
		totalMarks: z.number().min(1),
		passingMarks: z.number().min(1),
		gradingType: z.nativeEnum(ActivityGradingType),
		availabilityDate: z.date(),
		deadline: z.date(),
		instructions: z.string().optional(),
		timeLimit: z.number().optional(),
		attempts: z.number().optional(),
		viewType: z.nativeEnum(ActivityViewType),
		autoGradingConfig: z.object({
			scorePerQuestion: z.number(),
			penaltyPerWrongAnswer: z.number(),
			allowPartialCredit: z.boolean()
		}).optional()
	}),
	resources: z.array(z.object({
		title: z.string(),
		type: z.nativeEnum(ActivityResourceType),
		url: z.string(),
		fileInfo: z.object({
			size: z.number(),
			createdAt: z.date(),
			updatedAt: z.date(),
			mimeType: z.string(),
			publicUrl: z.string()
		}).optional()
	})).optional()
});

interface ActivityResponse {
	id: string;
	title: string;
	description: string | null;
	type: string;
	classId: string | null;
	subjectId: string;
	classGroupId: string | null;
	configuration: ActivityConfiguration;
	resources: ActivityResource[];
	class: { name: string } | null;
	subject: { name: string; id: string };
	classGroup: { 
		name: string;
		calendar?: {
			id: string;
			inheritSettings?: boolean;
		};
	} | null;
	teacherAssignments?: Array<{ teacherId: string; subjectId: string; }>;
}


import { ActivityScope } from "@/types/class-activity";

interface Props {
  activityId?: string;
  onClose: () => void;
}

// Implement ActivityFormManager
const ActivityFormManager = {
  baseFields: ['title', 'description', 'type'] as const,
  curriculumExtension: ['learningObjectives', 'prerequisites'] as const,
  classExtension: ['deadline', 'classGroups'] as const,

  validateCommon(data: FormData) {
    const errors: Record<string, string> = {};
    
    if (!data.title?.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!data.type) {
      errors.type = 'Activity type is required';
    }
    
    return errors;
  },

  validateScope(data: FormData, scope: ActivityScope) {
    const errors: Record<string, string> = {};
    
    if (scope === ActivityScope.CURRICULUM && !data.subjectIds?.length) {
      errors.subjectIds = 'At least one subject is required for curriculum activities';
    }
    
    if (scope === ActivityScope.CLASS && !data.classId) {
      errors.classId = 'Class is required for class activities';
    }
    
    return errors;
  },

  getDefaultValues(): FormData {
    return {
      title: '',
      description: '',
      type: ActivityType.ASSIGNMENT,
      subjectIds: [],
      teacherAssignments: [],
      inheritCalendar: true,
      configuration: {
        activityMode: ActivityMode.INDIVIDUAL,
        isGraded: false,
        totalMarks: 100,
        passingMarks: 40,
        gradingType: ActivityGradingType.NUMERIC,
        availabilityDate: new Date(),
        deadline: new Date(),
        viewType: ActivityViewType.SEQUENTIAL,
        instructions: '',
      },
      resources: []
    };
  }
};

const ClassActivityForm: React.FC<Props> = ({ activityId, onClose }) => {

  const { toast } = useToast();
  const utils = api.useUtils();
  const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: ActivityFormManager.getDefaultValues()
  });

	const { data: classes = [], isLoading: classesLoading } = api.class.list.useQuery();
	const { data: subjects = [], isLoading: subjectsLoading } = api.subject.getSubjectsByClassId.useQuery(
		{ classId: form.watch('classId') || '' },
		{ 
			enabled: !!form.watch('classId'),
			refetchOnMount: true
		}
	);

	const { data: teachers = [], isLoading: teachersLoading } = api.teacher.searchTeachers.useQuery({});
  const { data: classGroups = [], isLoading: classGroupsLoading } = api.classGroup.list.useQuery();



  useEffect(() => {
    if (form.watch('classId')) {
      form.setValue('subjectIds', []);
      form.setValue('teacherAssignments', []);
    }
  }, [form.watch('classId'), form]);

  useEffect(() => {
    if (activityId) {
      utils.classActivity.getById.fetch(activityId)
        .then((data: ActivityResponse) => {
          form.reset(data);
        });
    }
  }, [activityId, utils.classActivity.getById, form]);

    const onSubmit = (data: FormData) => {
        if (activityId) {
            updateMutation.mutate({ id: activityId, ...data });
        } else {
            createMutation.mutate(data);
        }
    };


  const createMutation = api.classActivity.create.useMutation({
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Activity created successfully",
      });
      utils.classActivity.getAll.invalidate();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const updateMutation = api.classActivity.update.useMutation({
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Activity updated successfully",
      });
      utils.classActivity.getAll.invalidate();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

	const isLoadingData = classesLoading || subjectsLoading || classGroupsLoading || teachersLoading || isLoading;

	return (
		<div className="container max-w-4xl mx-auto py-8">
			{isLoadingData && <div>Loading...</div>}
			<div className="bg-card rounded-lg shadow">
				<div className="px-6 py-4 border-b">
					<h2 className="text-2xl font-bold">
						{activityId ? 'Edit Activity' : 'Create New Activity'}
					</h2>
				</div>
				<div className="p-6">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{/* Basic Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">Basic Information</h3>
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Class and Subject Selection */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">Class and Subject</h3>

								{/* Class Group and Calendar Settings */}
								<div className="space-y-4">
									<h3 className="text-lg font-medium">Class Group and Subjects</h3>
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="classGroupId"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Class Group</FormLabel>
													<Select onValueChange={field.onChange} value={field.value}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select class group" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															{classGroups?.map((group: { id: string; name: string }) => (
																<SelectItem key={group.id} value={group.id}>
																	{group.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="inheritCalendar"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Inherit Calendar</FormLabel>
													<Select 
														onValueChange={(value) => field.onChange(value === 'true')} 
														value={field.value ? 'true' : 'false'}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select calendar inheritance" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="true">Yes</SelectItem>
															<SelectItem value="false">No</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="classId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Class</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select class" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{classes?.map((cls: { id: string; name: string }) => (
															<SelectItem key={cls.id} value={cls.id}>
																{cls.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="subjectIds"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Subjects</FormLabel>
												<MultiSelect<string>
													options={subjects?.map((subject) => ({
														label: subject.name,
														value: subject.id
													})) || []}
													value={field.value}
													onChange={field.onChange}
													disabled={!form.watch('classId')}
													placeholder={form.watch('classId') 
														? "Select subjects" 
														: "Please select a class first"
													}
												/>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>




								{/* Teacher Assignments */}
								{form.watch('subjectIds')?.length > 0 && (
									<div className="mt-4">
										<h3 className="text-lg font-medium mb-4">Teacher Assignments</h3>
										{form.watch('subjectIds').map((subjectId: string, index: number) => (
											<div key={subjectId} className="mb-4">
												<FormField
													control={form.control}
													name={`teacherAssignments.${index}`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>
																Teacher for {subjects?.find(s => s.id === subjectId)?.name || 'Subject'}
															</FormLabel>
															<Select 
																onValueChange={(value) => {
																	const assignments = [...form.watch('teacherAssignments')];
																	assignments[index] = {
																		subjectId,
																		teacherId: value
																	};
																	form.setValue('teacherAssignments', assignments);
																}}
																value={field.value?.teacherId}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select teacher" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{teachers?.map((teacher) => (
																		<SelectItem key={teacher.id} value={teacher.id}>
																			{teacher.name || 'Unnamed Teacher'}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Activity Type and Configuration */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">Activity Settings</h3>
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="type"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Activity Type</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select type" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{Object.values(ActivityType).map((type) => (
															<SelectItem key={type} value={type}>
																{type.replace(/_/g, ' ')}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="configuration.activityMode"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Activity Mode</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select mode" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{Object.values(ActivityMode).map((mode) => (
															<SelectItem key={mode} value={mode}>
																{mode.replace(/_/g, ' ')}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="configuration.isGraded"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Is Graded</FormLabel>
												<Select 
													onValueChange={(value) => field.onChange(value === 'true')} 
													value={field.value ? 'true' : 'false'}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select grading status" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="true">Yes</SelectItem>
														<SelectItem value="false">No</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Configuration Fields */}
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="configuration.totalMarks"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Total Marks</FormLabel>
												<FormControl>
													<Input 
														type="number" 
														{...field}
														onChange={(e) => field.onChange(Number(e.target.value))}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="configuration.passingMarks"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Passing Marks</FormLabel>
												<FormControl>
													<Input 
														type="number" 
														{...field}
														onChange={(e) => field.onChange(Number(e.target.value))}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="configuration.availabilityDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Start Date</FormLabel>
												<FormControl>
													<Input 
														type="datetime-local" 
														{...field}
														value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
														onChange={(e) => field.onChange(new Date(e.target.value))}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="configuration.deadline"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Deadline</FormLabel>
												<FormControl>
													<Input 
														type="datetime-local" 
														{...field}
														value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
														onChange={(e) => field.onChange(new Date(e.target.value))}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="col-span-2">
									<FormField
										control={form.control}
										name="configuration.instructions"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Instructions</FormLabel>
												<FormControl>
													<Textarea {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							{/* Resources */}
							<ResourcesSection 
								form={form as unknown as UseFormReturn<{ resources?: Resource[] }> } 
							/>

							{/* Form Actions */}
							<div className="flex justify-end space-x-2 pt-6 border-t">
								<Button type="button" variant="outline" onClick={onClose}>
									Cancel
								</Button>
								<Button type="submit">
									{activityId ? "Update" : "Create"} Activity
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</div>
		</div>
	);

}
