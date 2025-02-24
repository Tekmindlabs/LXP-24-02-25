import { UserType, Status, AttendanceStatus, CampusRole } from "./enums";
import { Campus } from "./campus";

export interface User {
	id: string;
	name?: string | null;
	email?: string | null;
	phoneNumber?: string | null;
	emailVerified?: Date | null;
	image?: string | null;
	password?: string | null;
	status: Status;
	userType?: UserType | null;

	// Campus Relations
	campusRoles?: CampusRole[];
	primaryCampus?: Campus;
	primaryCampusId?: string;

	createdAt: Date;
	updatedAt: Date;
	deleted?: Date | null;
	dataRetentionDate?: Date | null;
	dateOfBirth?: Date | null;
}

export interface UserAttendance {
	id: string;
	date: Date;
	status: AttendanceStatus;
	notes?: string;
}

