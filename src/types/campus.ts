import { Status, Campus as PrismaCampus, Program, ClassGroup } from "@prisma/client";
import { TeacherProfile } from "./teacher";
import { StudentProfile } from "./student";
import { Class } from "./class";
import { User } from "./user";
import { RoleTemplate as Role } from './roles';

export interface CampusContextType {
  currentCampus: PrismaCampus | null;
  setCurrentCampus: (campus: PrismaCampus | null) => void;
  programs: Program[];
  classGroups: ClassGroup[];
  refreshData: () => Promise<void>;
  isRefreshing: boolean;
}

export interface RolePermission {
	id: string;
	roleId: string;
	permissionId: string;
	role?: Role;
	permission?: {
	  id: string;
	  name: string;
	  description?: string;
	};
	createdAt: Date;
	updatedAt: Date;
  }

export enum CampusPermission {
  MANAGE_CAMPUS = "campus:manage",
  MANAGE_CAMPUS_CLASSES = "campus:manage-classes",
  MANAGE_CAMPUS_TEACHERS = "campus:manage-teachers",
  MANAGE_CAMPUS_STUDENTS = "campus:manage-students",
  MANAGE_CAMPUS_TIMETABLES = "campus:manage-timetables",
  MANAGE_CAMPUS_ATTENDANCE = "campus:manage-attendance",
  VIEW_CAMPUS_ANALYTICS = "campus:view-analytics",
  VIEW_PROGRAMS = "campus:view-programs",
  VIEW_CAMPUS_CLASSES = "campus:view-classes",
  VIEW_CLASS_GROUPS = "campus:view-class-groups"
}

export enum CampusType {
  MAIN = 'MAIN',
  BRANCH = 'BRANCH'
}

export enum RoomType {
  CLASSROOM = 'CLASSROOM',
  LAB = 'LAB',
  ACTIVITY_ROOM = 'ACTIVITY_ROOM',
  LECTURE_HALL = 'LECTURE_HALL'
}

export enum RoomStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE'
}

export interface CampusFeature {
	id: string;
	name: string;
	description?: string; 
	campusId: string;
	campus?: Campus;
	createdAt: Date;
	updatedAt: Date;
  }

export interface Campus {
  id: string;
  name: string;
  code: string;
  establishmentDate: Date;
  type: CampusType;
  status: Status;
  
  // Location Information
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  gpsCoordinates?: string;
  
  // Contact Information
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  emergencyContact: string;
  
  // Relations
  buildings?: Building[];
  roles?: CampusRole[];
  features?: CampusFeature[];
  sync?: CampusSync;
  classes?: Class[];
  rolePermissions?: RolePermission[];
  programs?: Program[];
  coordinators?: CoordinatorProfile[];
  students?: StudentProfile[];
  teachers?: TeacherProfile[];
  classGroups?: ClassGroup[];

  // Audit fields
  createdAt: Date;
  updatedAt: Date;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  campusId: string;
  campus?: Campus;
  floors?: Floor[];
  classes?: Class[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Floor {
  id: string;
  number: number;
  buildingId: string;
  building?: Building;
  wings?: Wing[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Wing {
  id: string;
  name: string;
  floorId: string;
  floor?: Floor;
  rooms?: Room[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  number: string;
  wingId: string;
  wing?: Wing;
  type: RoomType;
  capacity: number;
  status: RoomStatus;
  resources?: Record<string, any>;
  periods?: Period[];
  classes?: Class[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Period {
  id: string;
  startTime: Date;
  endTime: Date;
  durationInMinutes: number;
  dayOfWeek: number;
  subjectId: string;
  roomId?: string;
  timetableId: string;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampusRole {
  id: string;
  userId: string;
  campusId: string;
  roleId: string;
  user: User;
  campus: Campus;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface CoordinatorProfile {
	id: string;
	userId: string;
	campusId: string;
	user: User;
	campus: Campus;
	status?: Status;
  type: 'PROGRAM_COORDINATOR' | 'CAMPUS_PROGRAM_COORDINATOR';
	department?: string;
	createdAt: Date;
	updatedAt: Date;
  }

export interface CampusSync {
  id: string;
  campusId: string;
  lastSyncedAt: Date;
  status: string;
  error?: string;
  campus: Campus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampusClass extends Omit<Class, 'room' | 'campus' | 'building'> {
  campus: {
    id: string;
    name: string;
  };
  building: {
    id: string;
    name: string;
  };
  room: {
    id: string;
    number: string;
    type: RoomType;
    capacity: number;
  };
  campusTeachers: CampusTeacher[];
  campusStudents: CampusStudent[];
}

export interface CampusTeacher extends TeacherProfile {
	campus: {
	  id: string;
	  name: string;
	};
	assignedClasses: {
	  id: string;
	  name: string;
	  classGroup: {
		name: string;
	  };
	  isClassTeacher: boolean;
	}[];
  }
  
  export interface CampusStudent extends StudentProfile {
	campus: {
	  id: string;
	  name: string;
	};
	assignedClass: {
	  id: string;
	  name: string;
	  classGroup: {
		name: string;
	  };
	};
  }

export interface CampusAttendance {
  id: string;
  student: CampusStudent;
  class: CampusClass;
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
  markedBy: CampusTeacher;
  room: {
    id: string;
    number: string;
    type: RoomType;
  };
  building: {
    id: string;
    name: string;
  };
}

export enum CampusRoleType {
  CAMPUS_ADMIN = 'CAMPUS_ADMIN',
  CAMPUS_MANAGER = 'CAMPUS_MANAGER',
  CAMPUS_TEACHER = 'CAMPUS_TEACHER',
  CAMPUS_PROGRAM_COORDINATOR = 'CAMPUS_PROGRAM_COORDINATOR'
}

export { Status };
