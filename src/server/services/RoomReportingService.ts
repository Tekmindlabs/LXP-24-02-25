import { PrismaClient, Room, Period } from "@prisma/client";
import { TRPCError } from "@trpc/server";

type RoomWithPeriods = Room & {
	periods: Period[];
};

const prisma = new PrismaClient();

export interface DateRange {
	startDate: Date;
	endDate: Date;
}

export interface UsageReport {
	totalHours: number;
	periodCount: number;
	usageByDay: Record<number, number>; // day of week -> hours
	usageByTimeSlot: Record<string, number>; // hour -> count
	mostUsedRooms: Array<{
		room: RoomWithPeriods;
		hours: number;
		periodCount: number;
	}>;
}

export interface UtilizationReport {
	room: RoomWithPeriods;
	totalCapacity: number;
	averageUtilization: number;
	peakUtilization: number;
	resourceUtilization: Record<string, {
		totalHours: number;
		utilizationRate: number;
	}>;
}

export interface MaintenanceReport {
	roomsNeedingMaintenance: Array<{
		room: Room;
		lastMaintenance?: Date;
		issues: string[];
	}>;
	resourcesNeedingMaintenance: Array<{
		roomId: string;
		resourceType: string;
		status: string;
		lastMaintenance?: Date;
	}>;
}

export class RoomReportingService {
	async generateUsageReport(timeRange: DateRange): Promise<UsageReport> {
		const periods = await prisma.period.findMany({
			where: {
				startTime: { gte: timeRange.startDate },
				endTime: { lte: timeRange.endDate },
				roomId: { not: null }
			},
			include: {
				room: {
					include: {
						periods: true
					}
				}
			}
		});


		const usageByDay: Record<number, number> = {};
		const usageByTimeSlot: Record<string, number> = {};
		const roomUsage: Record<string, { hours: number; periodCount: number }> = {};

		for (const period of periods) {
			if (!period.roomId || !period.room) continue;

			const hours = (period.endTime.getTime() - period.startTime.getTime()) / (1000 * 60 * 60);
			
			usageByDay[period.dayOfWeek] = (usageByDay[period.dayOfWeek] || 0) + hours;
			
			const timeSlot = period.startTime.getHours().toString().padStart(2, '0');
			usageByTimeSlot[timeSlot] = (usageByTimeSlot[timeSlot] || 0) + 1;

			if (!roomUsage[period.roomId]) {
				roomUsage[period.roomId] = { hours: 0, periodCount: 0 };
			}
			roomUsage[period.roomId].hours += hours;
			roomUsage[period.roomId].periodCount += 1;
		}


		const totalHours = Object.values(usageByDay).reduce((sum, hours) => sum + hours, 0);
		const totalPeriods = periods.length;

		// Get most used rooms
		const mostUsedRooms = await Promise.all(
			Object.entries(roomUsage)
				.sort(([, a], [, b]) => b.hours - a.hours)
				.slice(0, 5)
				.map(async ([roomId, usage]) => {
					const room = await prisma.room.findUnique({
						where: { id: roomId },
						include: { periods: true }
					});
					if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' });
					return {
						room,
						hours: usage.hours,
						periodCount: usage.periodCount
					};
				})
		);

		return {
			totalHours,
			periodCount: totalPeriods,
			usageByDay,
			usageByTimeSlot,
			mostUsedRooms
		};

	}

	async generateResourceUtilizationReport(roomId: string): Promise<UtilizationReport> {
		const room = await prisma.room.findUnique({
			where: { id: roomId },
			include: {
				periods: {
					where: {
						endTime: { gte: new Date() }
					}
				}
			}
		});

		if (!room) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Room not found'
			});
		}

		const resources = room.resources as Record<string, any> || {};
		const resourceUtilization: Record<string, { totalHours: number; utilizationRate: number }> = {};

		// Calculate resource utilization
		for (const [resourceType, resource] of Object.entries(resources)) {
			const totalHours = room.periods.reduce((sum: number, period: Period) => {
				return sum + (period.endTime.getTime() - period.startTime.getTime()) / (1000 * 60 * 60);
			}, 0);

			resourceUtilization[resourceType] = {
				totalHours,
				utilizationRate: totalHours > 0 ? (resource.inUseCount || 0) / totalHours : 0
			};
		}

		// Calculate average and peak utilization
		const utilizationRates = room.periods.map((period: Period) => {
			// Assuming each period has a certain number of attendees or utilization metric
			return 1; // This should be replaced with actual utilization calculation
		});

		return {
			room,
			totalCapacity: room.capacity,
			averageUtilization: utilizationRates.length > 0 
				? utilizationRates.reduce((a, b) => a + b) / utilizationRates.length 
				: 0,
			peakUtilization: utilizationRates.length > 0 
				? Math.max(...utilizationRates) 
				: 0,
			resourceUtilization
		};
	}

	async generateMaintenanceReport(): Promise<MaintenanceReport> {
		const rooms = await prisma.room.findMany({
			where: {
				OR: [
					{ status: 'MAINTENANCE' },
					{
						resources: {
							path: ['$.*.status'],
							string_contains: 'MAINTENANCE'
						}
					}
				]
			}
		});

		const roomsNeedingMaintenance = rooms.map((room: Room) => {
			const resources = room.resources as Record<string, any> || {};
			const issues = Object.entries(resources)
				.filter(([, resource]) => resource.status === 'MAINTENANCE')
				.map(([type]) => `${type} needs maintenance`);

			return {
				room,
				issues: room.status === 'MAINTENANCE' 
					? ['Room under maintenance', ...issues]
					: issues
			};
		});

		const resourcesNeedingMaintenance = rooms.flatMap((room: Room) => {
			const resources = room.resources as Record<string, any> || {};
			return Object.entries(resources)
				.filter(([, resource]) => resource.status === 'MAINTENANCE')
				.map(([type, resource]) => ({
					roomId: room.id,
					resourceType: type,
					status: 'MAINTENANCE',
					lastMaintenance: resource.lastMaintenance
				}));
		});

		return {
			roomsNeedingMaintenance,
			resourcesNeedingMaintenance
		};
	}
}