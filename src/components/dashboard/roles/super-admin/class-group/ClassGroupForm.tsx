'use client';

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { api } from "@/utils/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { JsonValue } from "@prisma/client/runtime/library";
import { Status, CalendarType, Visibility } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

interface Program {
	id: string;
	name: string | null;
	calendar: {
		metadata: JsonValue;
		name: string;
		status: Status;
		type: CalendarType;
		description: string | null;
		id: string;
		createdAt: Date;
		updatedAt: Date;
		visibility: Visibility;
	};
}

interface Subject {
	id: string;
	name: string;
	code: string;
}

interface Calendar {
	id: string;
	name: string;
	description: string | null;
	type: CalendarType;
	status: Status;
}

interface FormData {
	name: string;
	description?: string;
	programId: string;
	status: Status;
	calendar: {
		id: string;
		inheritSettings: boolean;
	};
	subjectIds: string[];
}


interface Props {
	selectedClassGroup?: {
		id: string;
		name: string;
		description: string | null;
		programId: string;
		status: Status;
		calendarId?: string;
		subjects?: Subject[];
	};
	programs: Program[];
	subjects: Subject[];
	onSuccess?: () => void;
}


export const ClassGroupForm = ({ selectedClassGroup, programs, subjects, onSuccess }: Props) => {
	// 1. Form hook
	const form = useForm<FormData>({
		defaultValues: {
			name: selectedClassGroup?.name || "",
			description: selectedClassGroup?.description || undefined,
			programId: selectedClassGroup?.programId || "",
			status: selectedClassGroup?.status || Status.ACTIVE,
			calendar: {
				id: selectedClassGroup?.calendarId || "",
				inheritSettings: false
			},
			subjectIds: selectedClassGroup?.subjects?.map(s => s.id) || []
		}
	});

	// Watch form values for reactive updates
	const watchedValues = form.watch();

	// 2. Context hooks
	const utils = api.useContext();
	const { toast } = useToast();

	// 3. Query hooks
	const { 
		data: calendars, 
		isLoading: calendarsLoading, 
		error: calendarsError 
	} = api.calendar.getAll.useQuery();
	
	const { 
		data: campuses, 
		isLoading: campusesLoading, 
		error: campusesError 
	} = api.campus.getAll.useQuery();

	// 4. Mutation hooks
	const createMutation = api.classGroup.create.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Class group created successfully",
			});
			utils.classGroup.getAllClassGroups.invalidate();
			onSuccess?.();
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const updateMutation = api.classGroup.update.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Class group updated successfully",
			});
			utils.classGroup.getAllClassGroups.invalidate();
			onSuccess?.();
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	// 5. Derived state
	const loading = calendarsLoading || campusesLoading;
	const error = calendarsError || campusesError;

	// 6. Event handlers
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const formValues = form.getValues();
		const selectedCalendar = calendars?.find(c => c.id === formValues.calendar.id);

		if (!selectedCalendar) {
			toast({
				title: "Error",
				description: "Selected calendar not found",
				variant: "destructive",
			});
			return;
		}

		const mutationData = {
			name: formValues.name,
			description: formValues.description,
			programId: formValues.programId,
			status: formValues.status,
			calendar: {
				id: selectedCalendar.id,
				name: selectedCalendar.name,
				startDate: selectedCalendar.startDate,
				endDate: selectedCalendar.endDate
			},
			subjectIds: formValues.subjectIds
		};

		if (selectedClassGroup) {
			updateMutation.mutate({
				id: selectedClassGroup.id,
				...mutationData
			});
		} else {
			createMutation.mutate(mutationData);
		}
	};

	// 7. Loading and error states
	if (loading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return <Alert variant="destructive">{error.message || 'An error occurred while loading data'}</Alert>;
	}

	if (!campuses || !calendars) {
		return <Alert variant="destructive">Required data is missing</Alert>;
	}

	// 8. Render
	return (
		<Form {...form}>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						{...form.register('name')}
						required
					/>
				</div>

				<div>
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						{...form.register('description')}
					/>
				</div>

				<div>
					<Label htmlFor="program">Program</Label>
					<Select
						value={watchedValues.programId}
						onValueChange={(value) => form.setValue('programId', value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select a program" />
						</SelectTrigger>
						<SelectContent>
							{programs.map((program: Program) => (
								<SelectItem key={program.id} value={program.id}>
									{program.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label htmlFor="calendar">Calendar</Label>
					<Select
						value={watchedValues.calendar.id}
						onValueChange={(value) => form.setValue('calendar.id', value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select a calendar" />
						</SelectTrigger>
						<SelectContent>
							{calendars?.map((calendar: Calendar) => (
								<SelectItem key={calendar.id} value={calendar.id}>
									{calendar.name || 'Unnamed Calendar'}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label>Subjects</Label>
					<MultiSelect
						options={subjects?.map(subject => ({
							label: `${subject.name} (${subject.code})`,
							value: subject.id,
						})) || []}
						value={watchedValues.subjectIds}
						onChange={(values) => form.setValue("subjectIds", values)}
						placeholder="Select subjects"
					/>
				</div>

				<Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
					{selectedClassGroup ? "Update" : "Create"} Class Group
				</Button>
			</form>
		</Form>
	);
};
