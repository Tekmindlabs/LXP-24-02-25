import { DateTime } from "luxon";
import { PrismaClient, Period, Room } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const prisma = new PrismaClient();

export interface ScheduleRequest {
	roomId: string;
	startTime: DateTime;
	endTime: DateTime;
	dayOfWeek: number;
	subjectId: string;
	teacherId: string;
	timetableId: string;
}

export interface ScheduleResult {
	success: boolean;
	roomId: string;
	error?: string;
}

export interface Conflict {
	type: 'ROOM' | 'TEACHER';
	existingPeriod: Period;
	requestedTime: {
		start: DateTime;
		end: DateTime;
	};
}

export class RoomSchedulingService {
	async checkRoomAvailability(
		roomId: string, 
		startTime: DateTime, 
		endTime: DateTime,
		dayOfWeek: number
	): Promise<boolean> {
		const existingPeriod = await prisma.period.findFirst({
			where: {
				classroomId: roomId,
				dayOfWeek,
				OR: [
					{
						AND: [
							{ startTime: { lte: startTime.toJSDate() } },
							{ endTime: { gt: startTime.toJSDate() } }
						]
					},
					{
						AND: [
							{ startTime: { lt: endTime.toJSDate() } },
							{ endTime: { gte: endTime.toJSDate() } }
						]
					}
				]
			}
		});

		return !existingPeriod;
	}

	async detectScheduleConflicts(request: ScheduleRequest): Promise<Conflict[]> {
		const conflicts: Conflict[] = [];

		// Check room conflicts
		const roomConflict = await prisma.period.findFirst({
			where: {
				classroomId: request.roomId,
				dayOfWeek: request.dayOfWeek,
				OR: [
					{
						AND: [
							{ startTime: { lte: request.startTime.toJSDate() } },
							{ endTime: { gt: request.startTime.toJSDate() } }
						]
					},
					{
						AND: [
							{ startTime: { lt: request.endTime.toJSDate() } },
							{ endTime: { gte: request.endTime.toJSDate() } }
						]
					}
				]
			}
		});

		if (roomConflict) {
			conflicts.push({
				type: 'ROOM',
				existingPeriod: roomConflict,
				requestedTime: {
					start: request.startTime,
					end: request.endTime
				}
			});
		}

		// Check teacher conflicts
		const teacherConflict = await prisma.period.findFirst({
			where: {
				teacherId: request.teacherId,
				dayOfWeek: request.dayOfWeek,
				OR: [
					{
						AND: [
							{ startTime: { lte: request.startTime.toJSDate() } },
							{ endTime: { gt: request.startTime.toJSDate() } }
						]
					},
					{
						AND: [
							{ startTime: { lt: request.endTime.toJSDate() } },
							{ endTime: { gte: request.endTime.toJSDate() } }
						]
					}
				]
			}
		});

		if (teacherConflict) {
			conflicts.push({
				type: 'TEACHER',
				existingPeriod: teacherConflict,
				requestedTime: {
					start: request.startTime,
					end: request.endTime
				}
			});
		}

		return conflicts;
	}

	async batchScheduleRooms(requests: ScheduleRequest[]): Promise<ScheduleResult[]> {
		const results: ScheduleResult[] = [];

		await prisma.$transaction(async (prisma) => {
			for (const request of requests) {
				try {
					const conflicts = await this.detectScheduleConflicts(request);
					
					if (conflicts.length > 0) {
						results.push({
							success: false,
							roomId: request.roomId,
							error: `Conflicts detected: ${conflicts.map(c => c.type).join(', ')}`
						});
						continue;
					}

					await prisma.period.create({
						data: {
							startTime: request.startTime.toJSDate(),
							endTime: request.endTime.toJSDate(),
							dayOfWeek: request.dayOfWeek,
							subjectId: request.subjectId,
							teacherId: request.teacherId,
							timetableId: request.timetableId,
							classroomId: request.roomId,
							durationInMinutes: request.endTime.diff(request.startTime, 'minutes').minutes
						}
					});

					results.push({
						success: true,
						roomId: request.roomId
					});
				} catch (error) {
					results.push({
						success: false,
						roomId: request.roomId,
						error: error instanceof Error ? error.message : 'Unknown error'
					});
				}
			}
			return results;
		});

		return results;
	}

}