import { PrismaClient } from "@prisma/client";
import { GradeBookService } from "./GradeBookService";
import { SubjectGradeManager } from "./SubjectGradeManager";
import { AssessmentService } from "./AssessmentService";

interface ActivityGrade {
	activityId: string;
	studentId: string;
	grade: number;
	assessmentPeriodId: string;
}

export class ActivityGradeService {
	private gradeBookService: GradeBookService;
	private subjectGradeManager: SubjectGradeManager;
	private assessmentService: AssessmentService;

	constructor(private db: PrismaClient) {
		this.gradeBookService = new GradeBookService(db);
		this.subjectGradeManager = new SubjectGradeManager(db);
		this.assessmentService = new AssessmentService(db);
	}

	async recordActivityGrade(data: ActivityGrade): Promise<void> {
		const activity = await this.validateAndGetActivity(data.activityId);
		
		// Record grade and update gradebook
		await this.gradeBookService.updateActivityGrade(data);

		// Recalculate assessment period grade
		await this.recalculateGrades(
			activity.subjectId,
			data.assessmentPeriodId,
			data.studentId,
			activity.class?.gradeBook?.assessmentSystemId
		);
	}

	private async validateAndGetActivity(activityId: string) {
		const activity = await this.db.classActivity.findUnique({
			where: { id: activityId },
			include: {
				class: {
					include: {
						gradeBook: true
					}
				}
			}
		});

		if (!activity?.class?.gradeBook) {
			throw new Error('Activity or gradebook not found');
		}

		return activity;
	}

	private async recalculateGrades(
		subjectId: string,
		assessmentPeriodId: string,
		studentId: string,
		assessmentSystemId: string
	): Promise<void> {
		const config = await this.getSubjectConfig(subjectId);
		
		// Recalculate assessment period grade
		await this.subjectGradeManager.calculateAssessmentPeriodGrade(
			subjectId,
			assessmentPeriodId,
			studentId,
			assessmentSystemId,
			config
		);

		// Get term for the assessment period
		const assessmentPeriod = await this.db.termAssessmentPeriod.findUnique({
			where: { id: assessmentPeriodId },
			include: { term: true }
		});

		if (assessmentPeriod?.term) {
			// Recalculate term grade
			await this.subjectGradeManager.calculateSubjectTermGrade(
				subjectId,
				assessmentPeriod.term.id,
				studentId,
				assessmentSystemId
			);
		}
	}

	private async getSubjectConfig(subjectId: string) {
		const subject = await this.db.subject.findUnique({
			where: { id: subjectId },
			include: { subjectConfig: true }
		});

		if (!subject?.subjectConfig) {
			throw new Error('Subject configuration not found');
		}

		return subject.subjectConfig;
	}
}