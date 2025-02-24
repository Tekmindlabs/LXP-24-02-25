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
			api.teacher.getById.query(String(params.id)) as Promise<Partial<Teacher>>,
			api.subject.searchSubjects.query({}),
			api.class.searchClasses.query({})
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

		const formattedTeacher = {
			id: teacher.id,
			name: teacher.name || '',
			email: teacher.email || '',
			phoneNumber: teacher.phoneNumber || '',
			status: teacher.status,
			teacherProfile: teacher.teacherProfile ? {
				teacherType: teacher.teacherProfile.teacherType ?? null,
				specialization: teacher.teacherProfile.specialization || '',
				availability: teacher.teacherProfile.availability || '',
				subjects: teacher.teacherProfile.subjects || [],
				classes: teacher.teacherProfile.classes || [],
			} : null
		};

		return (
			<div className="container mx-auto py-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>Edit Teacher</CardTitle>
					</CardHeader>
					<CardContent>
						<TeacherForm
							initialData={formattedTeacher}
							teacherId={teacher.id}
							subjects={subjects || []}
							classes={classes || []}
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
							Error loading teacher data. Please try again later.
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}
}
