import { PrismaClient } from "@prisma/client";

export class SubjectSyncService {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	async trackSubjectChanges(classGroupId: string, change: { type: 'CREATE' | 'UPDATE' | 'DELETE', subjectId: string }) {
		return this.prisma.subjectChangeLog.create({
			data: {
				classGroupId,
				changes: JSON.stringify({
					type: change.type,
					subjectId: change.subjectId,
					timestamp: new Date().toISOString()
				})
			}
		});
	}

	async syncClassSubjects(classGroupId: string, subjects?: string[]) {
		// If subjects not provided, get all subjects from class group
		if (!subjects) {
			const classGroup = await this.prisma.classGroup.findUnique({
				where: { id: classGroupId },
				include: { subjects: true }
			});
			subjects = classGroup?.subjects.map(s => s.id) || [];
		}

		// Get current subjects
		const currentSubjects = await this.prisma.subject.findMany({
			where: {
				classGroups: {
					some: { id: classGroupId }
				}
			}
		});

		// Create new subjects if needed
		const newSubjects = subjects.filter(subjectId => 
			!currentSubjects.some(cs => cs.id === subjectId)
		);

		if (newSubjects.length > 0) {
			await this.prisma.classGroup.update({
				where: { id: classGroupId },
				data: {
					subjects: {
						connect: newSubjects.map(id => ({ id }))
					}
				}
			});
		}

		// Remove subjects that are no longer needed
		const removedSubjects = currentSubjects
			.filter(cs => !subjects.includes(cs.id))
			.map(s => s.id);

		if (removedSubjects.length > 0) {
			await this.prisma.classGroup.update({
				where: { id: classGroupId },
				data: {
					subjects: {
						disconnect: removedSubjects.map(id => ({ id }))
					}
				}
			});
		}

		return {
			added: newSubjects.length,
			removed: removedSubjects.length
		};
	}
}

