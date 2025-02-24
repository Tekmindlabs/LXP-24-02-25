import { PrismaClient, Status } from "@prisma/client";
import { CampusUserService } from "./CampusUserService";
import { CampusPermission } from "../../types/enums";
import { TRPCError } from "@trpc/server";

interface AssignmentInput {
	title: string;
	description?: string;
	dueDate: Date;
	subjectId: string;
	classId: string;
	totalMarks: number;
	attachments?: { url: string; type: string }[];
}

export class CampusAssignmentService {
	constructor(
		private readonly db: PrismaClient,
		private readonly campusUserService: CampusUserService
	) {}

	async createAssignment(
		userId: string,
		campusId: string,
		data: AssignmentInput
	) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.MANAGE_CAMPUS_CLASSES
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to create assignments"
			});
		}

		return this.db.classActivity.create({
			data: {
				title: data.title,
				description: data.description,
				type: 'CLASS_ASSIGNMENT',
				status: 'PUBLISHED',
				configuration: {
					dueDate: data.dueDate,
					totalMarks: data.totalMarks,
					attachments: data.attachments || []
				},
				subject: { connect: { id: data.subjectId } },
				class: { connect: { id: data.classId } }
			},
			include: {
				subject: true,
				class: true
			}
		});
	}

	async getClassAssignments(
		userId: string,
		campusId: string,
		classId: string
	) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.VIEW_CAMPUS_CLASSES
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to view assignments"
			});
		}

		return this.db.classActivity.findMany({
			where: {
				classId,
				type: 'CLASS_ASSIGNMENT',
				status: { not: 'ARCHIVED' }
			},
			include: {
				subject: true,
				submissions: {
					include: {
						student: {
							include: {
								user: true
							}
						}
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		});
	}

	async submitAssignment(
		userId: string,
		campusId: string,
		assignmentId: string,
		content: any
	) {
		const assignment = await this.db.classActivity.findUnique({
			where: { id: assignmentId },
			include: { class: true }
		});

		if (!assignment) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Assignment not found"
			});
		}

		const student = await this.db.studentProfile.findFirst({
			where: { userId, classId: assignment.class.id }
		});

		if (!student) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Not enrolled in this class"
			});
		}

		return this.db.classActivitySubmission.create({
			data: {
				activity: { connect: { id: assignmentId } },
				student: { connect: { id: student.id } },
				content,
				status: 'SUBMITTED',
				submittedAt: new Date()
			}
		});
	}

	async gradeAssignment(
		userId: string,
		campusId: string,
		submissionId: string,
		grade: number,
		feedback?: string
	) {
		const hasPermission = await this.campusUserService.hasPermission(
			userId,
			campusId,
			CampusPermission.MANAGE_GRADES
		);

		if (!hasPermission) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions to grade assignments"
			});
		}

		return this.db.classActivitySubmission.update({
			where: { id: submissionId },
			data: {
				status: 'GRADED',
				obtainedMarks: grade,
				feedback,
				gradedAt: new Date()
			}
		});
	}
}