'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Status, AssessmentSystemType, TermSystemType } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

type ClassGroup = {
	id: string;
	name: string;
	description: string | null;
	status: Status;
	programId: string;
	calendarId: string;
	createdAt: Date;
	updatedAt: Date;
	program: {
		id: string;
		name: string | null;
		description: string | null;
		status: Status;
		createdAt: Date;
		updatedAt: Date;
		calendarId: string;
		termSystem: TermSystemType;
		coordinatorId: string | null;
		assessmentSystem: {
			description: string | null;
			type: AssessmentSystemType;
			id: string;
			createdAt: Date;
			updatedAt: Date;
			name: string;
			programId: string;
			cgpaConfig: JsonValue | null;
		} | null;
		termStructures: any[];
	};
};

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/utils/api";
import { ClassGroupList } from "./ClassGroupList";
import { ClassGroupForm } from "./ClassGroupForm";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Users, BookOpen, GraduationCap, School } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ClassGroupManagement = () => {
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const router = useRouter();

	const handleViewDetails = (id: string) => {
		router.push(`/dashboard/super-admin/class-group/${id}/view`);
	};

	const { 
		data: classGroups, 
		isLoading: groupsLoading,
		error: groupsError,
		refetch: refetchGroups 
	} = api.classGroup.getAllClassGroups.useQuery();

	const { 
		data: programs,
		isLoading: programsLoading,
		error: programsError 
	} = api.program.getAll.useQuery({
		page: 1,
		pageSize: 10
	});

	const {
		data: subjects,
		isLoading: subjectsLoading
	} = api.subject.searchSubjects.useQuery({
		search: "",
		status: "ACTIVE"
	});

	const { data: analyticsData } = api.classGroup.getOverallAnalytics.useQuery();

	const handleSuccess = () => {
		setSelectedGroupId(null);
		setIsCreating(false);
		void refetchGroups();
	};

	if (groupsError || programsError) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					{groupsError?.message || programsError?.message}
				</AlertDescription>
			</Alert>
		);
	}

	const isLoading = groupsLoading || programsLoading || subjectsLoading;
	const totalGroups = classGroups?.length || 0;
	const activeGroups = classGroups?.filter(g => g.status === 'ACTIVE').length || 0;
	const totalClasses = 0; // TODO: Implement when class data is available


	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold tracking-tight">Class Group Management</h2>
				<Dialog open={isCreating} onOpenChange={setIsCreating}>
					<DialogTrigger asChild>
						<Button>
							<PlusCircle className="mr-2 h-4 w-4" />
							Create Class Group
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-4xl">
						<DialogHeader>
							<DialogTitle>Create New Class Group</DialogTitle>
						</DialogHeader>
						<ClassGroupForm 
							programs={programs?.programs || []}
							selectedClassGroup={undefined}
							subjects={subjects || []}
							onSuccess={handleSuccess}
						/>

					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Groups</CardTitle>
						<School className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalGroups}</div>
						{analyticsData?.studentGrowth && (
							<p className={`text-xs ${analyticsData.studentGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
								{analyticsData.studentGrowth > 0 ? '+' : ''}{Math.round(analyticsData.studentGrowth)}% from last month
							</p>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Groups</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeGroups}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Classes</CardTitle>
						<GraduationCap className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalClasses}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
						<BookOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{0} {/* TODO: Implement when subject data is available */}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Class Groups Overview</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : (
						<>
							<ClassGroupList 
								classGroups={(classGroups || []).map(group => ({
									...group,
									program: {
										...group.program,
										name: group.program.name ?? 'Unnamed Program',
									}
								}))}
								onEdit={(id) => setSelectedGroupId(id)}
								onView={handleViewDetails}
							/>
							{selectedGroupId && (
								<Dialog open={!!selectedGroupId} onOpenChange={(open) => !open && setSelectedGroupId(null)}>
									<DialogContent className="max-w-4xl">
										<DialogHeader>
											<DialogTitle>Edit Class Group</DialogTitle>
										</DialogHeader>
										<ClassGroupForm 
											programs={programs?.programs || []}
											selectedClassGroup={classGroups?.find(g => g.id === selectedGroupId)}
											subjects={subjects || []}
											onSuccess={handleSuccess}
										/>

									</DialogContent>

								</Dialog>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
