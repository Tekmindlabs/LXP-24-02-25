import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TeacherForm from "@/components/dashboard/roles/super-admin/teacher/TeacherForm";
import { api } from "@/trpc/server";
import { Status, TeacherType } from "@prisma/client";

interface Teacher {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  status: Status;
  teacherProfile?: {
    id: string;
    teacherType: TeacherType;
    specialization: string | null;
    subjectIds: string[];
    classIds: string[];
    campusIds: string[];
  } | null;
}

interface Subject {
  id: string;
  name: string;
  status: Status;
}

interface Class {
  id: string;
  name: string;
  status: Status;
}

export default async function EditTeacherPage({
  params
}: {
  params: { id: string; role: string }
}) {
  const teacherId = params.id;
  
  if (!teacherId) {
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
    const [teacher, subjects, classes] = await Promise.all([
      api.teacher.getById.query(teacherId) as Promise<Teacher>,
      api.subject.searchSubjects.query({ 
        status: Status.ACTIVE 
      }) as Promise<Subject[]>,
      api.class.searchClasses.query({ 
        status: Status.ACTIVE 
      }) as Promise<Class[]>
    ]).catch((error) => {
      console.error("Error loading data:", error);
      throw error;
    });
      
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
      name: teacher.name || "",
      email: teacher.email || "",
      phoneNumber: teacher.phoneNumber || "",
      teacherType: teacher.teacherProfile?.teacherType || TeacherType.CLASS,
      specialization: teacher.teacherProfile?.specialization || "",
      campusIds: teacher.teacherProfile?.campusIds || [],
      subjectIds: teacher.teacherProfile?.subjectIds || [],
      classIds: teacher.teacherProfile?.classIds || []
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