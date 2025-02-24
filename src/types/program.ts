import { Status } from "@prisma/client";
import { AssessmentSystemType } from "@/types/assessment";

export interface Calendar {
	id: string;
	name: string;
}

// in /src/types/program.ts

export interface Coordinator {
	id: string;
	name: string;
	email: string;
	status: Status;
	type: 'PROGRAM_COORDINATOR' | 'CAMPUS_PROGRAM_COORDINATOR';
	coordinatorProfile: {
	  programs: {
		id: string;
		name: string;
	  }[];
	  campus?: {
		id: string;
		name: string;
	  };
	  responsibilities: string[];
	};
  }

export type TermSystemType = 'SEMESTER' | 'TERM' | 'QUARTER';

export interface ProgramFormData {
	name: string;
	description?: string;
	calendarId: string;
	campusId: string[]; // This remains as campusId for form handling
	coordinatorId?: string;
	status: Status;
	termSystem?: {
		type: TermSystemType;
		terms: Array<{
			name: string;
			startDate: Date;
			endDate: Date;
			type: TermSystemType;
			assessmentPeriods: Array<{
				name: string;
				startDate: Date;
				endDate: Date;
				weight: number;
			}>;
		}>;
	};
	assessmentSystem?: {
		type: AssessmentSystemType;
		markingScheme?: any;
		rubric?: any;
		cgpaConfig?: any;
	};
}

export interface Campus {
	id: string;
	name: string;
}

export interface Program extends ProgramFormData {
	id: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ProgramFormProps {
	selectedProgram?: Program;
	coordinators: Coordinator[];
	campuses: Campus[];
	calendars: Calendar[];
	onSuccess: () => void;
}
