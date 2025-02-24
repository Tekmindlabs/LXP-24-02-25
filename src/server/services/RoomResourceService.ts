import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const prisma = new PrismaClient();

export const resourceSchema = z.object({
	type: z.enum(['PROJECTOR', 'COMPUTER', 'WHITEBOARD', 'AUDIO_SYSTEM']),
	quantity: z.number().min(1),
	status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE']),
	metadata: z.record(z.string(), z.any()).optional(),
});

export type ResourceType = z.infer<typeof resourceSchema>["type"];
export type ResourceStatus = z.infer<typeof resourceSchema>["status"];

export interface ResourceUpdate {
	type: ResourceType;
	quantity: number;
	status: ResourceStatus;
	metadata?: Record<string, any>;
}

export interface AvailabilityResult {
	available: boolean;
	currentQuantity: number;
	availableQuantity: number;
}

export interface ResourceAllocationRequest {
	roomId: string;
	resources: ResourceUpdate[];
	startTime: Date;
	endTime: Date;
}

export interface AllocationResult {
	success: boolean;
	allocatedResources: ResourceUpdate[];
	failedResources: Array<{
		resource: ResourceUpdate;
		reason: string;
	}>;
}

export class RoomResourceService {
	async updateRoomResources(roomId: string, resources: ResourceUpdate[]): Promise<void> {
		const room = await prisma.room.findUnique({
			where: { id: roomId }
		});

		if (!room) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Room not found'
			});
		}

		const currentResources = room.resources as Record<string, any> || {};
		const updatedResources = { ...currentResources };

		for (const resource of resources) {
			updatedResources[resource.type] = {
				quantity: resource.quantity,
				status: resource.status,
				metadata: resource.metadata || {}
			};
		}

		await prisma.room.update({
			where: { id: roomId },
			data: { resources: updatedResources }
		});
	}

	async checkResourceAvailability(
		roomId: string,
		resourceType: ResourceType,
		quantity: number
	): Promise<AvailabilityResult> {
		const room = await prisma.room.findUnique({
			where: { id: roomId }
		});

		if (!room) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Room not found'
			});
		}

		const resources = room.resources as Record<string, any> || {};
		const resource = resources[resourceType];

		if (!resource) {
			return {
				available: false,
				currentQuantity: 0,
				availableQuantity: 0
			};
		}

		const availableQuantity = resource.status === 'AVAILABLE' ? resource.quantity : 0;

		return {
			available: availableQuantity >= quantity,
			currentQuantity: resource.quantity,
			availableQuantity
		};
	}

	async allocateResources(request: ResourceAllocationRequest): Promise<AllocationResult> {
		const result: AllocationResult = {
			success: true,
			allocatedResources: [],
			failedResources: []
		};

		// Use transaction to ensure atomicity
		await prisma.$transaction(async (prisma) => {
			const room = await prisma.room.findUnique({
				where: { id: request.roomId }
			});

			if (!room) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Room not found'
				});
			}

			const currentResources = room.resources as Record<string, any> || {};
			const updatedResources = { ...currentResources };

			for (const resource of request.resources) {
				const currentResource = currentResources[resource.type];

				if (!currentResource || 
						currentResource.status !== 'AVAILABLE' || 
						currentResource.quantity < resource.quantity) {
					result.failedResources.push({
						resource,
						reason: 'Insufficient quantity or resource unavailable'
					});
					result.success = false;
					continue;
				}

				// Update resource status and quantity
				updatedResources[resource.type] = {
					...currentResource,
					quantity: currentResource.quantity - resource.quantity,
					status: currentResource.quantity - resource.quantity > 0 ? 'AVAILABLE' : 'IN_USE'
				};

				result.allocatedResources.push(resource);
			}

			if (result.success) {
				await prisma.room.update({
					where: { id: request.roomId },
					data: { resources: updatedResources }
				});
			}
		});

		return result;
	}
}