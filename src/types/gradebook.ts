export interface SubjectTermGrade {
	grade: string;
	score: number;
	totalMarks: number;
	percentage: number;
	isPassing: boolean;
	comments?: string;
	gradedAt: Date;
	gradedBy: string;
	finalGrade?: string;
	periodGrades?: Record<string, {
		percentage: number;
		grade: string;
	}>;
}

export interface GradeRecord {
	subjectId: string;
	termGrades: Record<string, SubjectTermGrade>;
	assessmentPeriodGrades?: Record<string, SubjectTermGrade>;
}

export interface GradebookData {
	classId: string;
	records: GradeRecord[];
}