import { User } from "./user";
import { RoleTemplate as Role } from './roles';

export enum TeacherType {
	CLASS = 'CLASS',
	SUBJECT = 'SUBJECT'
}

export interface TeacherProfile {
	id: string;
	userId: string;
	user: User;
	teacherType: TeacherType;
	specialization: string | null;
	availability: string | null;
	permissions: string[];
	subjects: TeacherSubject[];
	classes: TeacherClass[];
}

export interface TeacherSubject {
	subject: {
		id: string;
		name: string;
	};
	status: string;
}

export interface TeacherClass {
	class: {
		id: string;
		name: string;
		classGroup: {
			name: string;
		};
	};
	status: string;
	isClassTeacher: boolean;
}
