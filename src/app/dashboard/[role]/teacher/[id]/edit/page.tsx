import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TeacherForm from "@/components/dashboard/roles/super-admin/teacher/TeacherForm";
import { api } from "@/trpc/server"; // Use server-side TRPC client
import { TeacherProfile } from "@/types/teacher";
import { Status } from "@/types/enums";

interface Teacher {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  status: Status;
  teacherProfile?: TeacherProfile | null; // Make teacherProfile optional
}

export default async function EditTeacherPage({
	params
}: {
	params: { id: string; role: string }
}) {
	if (!params.id) {
		return (
			<div className="container mx-auto py-6">
				<Card>
					<CardContent>
						<div className="text-center text-red-500">Invalid teacher ID</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	try {
		// Fetch initial data server-side
		const [teacher, subjects, classes] = await Promise.all([
			api.teacher.getById.query(params.id), // params.id is already a string
			api.subject.searchSubjects.query({ 
				status: Status.ACTIVE // Add default search criteria
			}),
			api.class.searchClasses.query({ 
				status: Status.ACTIVE // Add default search criteria
			})
		]);
			
		if (!teacher) {
			return (
				<div className="container mx-auto py-6">
					<Card>
						<CardContent>
							<div className="text-center text-red-500">Teacher not found</div>
						</CardContent>
					</Card>
				</div>
			);
		}

		const sanitizedTeacher = {
			...teacher,
			name: teacher.name ?? undefined,
			email: teacher.email ?? undefined,
			phoneNumber: teacher.phoneNumber ?? undefined,
			teacherProfile: teacher.teacherProfile ? {
				...teacher.teacherProfile,
				specialization: teacher.teacherProfile.specialization ?? undefined,
				// Add other teacherProfile fields as needed
			} : undefined
		};

		return (
			<div className="container mx-auto py-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>Edit Teacher</CardTitle>
					</CardHeader>
					<CardContent>
						<TeacherForm 
							teacherId={params.id}
							initialData={sanitizedTeacher}
							subjects={subjects}
							classes={classes}
						/>
					</CardContent>
				</Card>
			</div>
		);
	} catch (error) {
		console.error('Error loading teacher:', error);
		return (
			<div className="container mx-auto py-6">
				<Card>
					<CardContent>
						<div className="text-center text-red-500">
							Error loading teacher data: {error instanceof Error ? error.message : 'Unknown error'}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}
}
