import type { Room } from "@prisma/client";

interface CachedRoom extends Room {
	cachedAt: number;
}

export class RoomCache {
	private cache: Map<string, CachedRoom>;
	private readonly ttl: number;

	constructor(ttl = 5 * 60 * 1000) { // 5 minutes default TTL
		this.cache = new Map();
		this.ttl = ttl;
	}

	async get(roomId: string): Promise<CachedRoom | null> {
		const cached = this.cache.get(roomId);
		if (!cached) return null;

		// Check if cache has expired
		if (Date.now() - cached.cachedAt > this.ttl) {
			this.cache.delete(roomId);
			return null;
		}

		return cached;
	}

	async set(roomId: string, room: Room): Promise<void> {
		const cachedRoom: CachedRoom = {
			...room,
			cachedAt: Date.now()
		};
		this.cache.set(roomId, cachedRoom);
	}

	async invalidate(roomId: string): Promise<void> {
		this.cache.delete(roomId);
	}

	async invalidateAll(): Promise<void> {
		this.cache.clear();
	}

	async getMany(roomIds: string[]): Promise<Map<string, CachedRoom>> {
		const result = new Map<string, CachedRoom>();
		for (const roomId of roomIds) {
			const cached = await this.get(roomId);
			if (cached) {
				result.set(roomId, cached);
			}
		}
		return result;
	}

	async setMany(rooms: Room[]): Promise<void> {
		for (const room of rooms) {
			await this.set(room.id, room);
		}
	}

	async invalidateMany(roomIds: string[]): Promise<void> {
		for (const roomId of roomIds) {
			await this.invalidate(roomId);
		}
	}
}