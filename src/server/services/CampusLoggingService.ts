import { PrismaClient } from "@prisma/client";

export enum LogLevel {
	INFO = 'INFO',
	WARNING = 'WARNING',
	ERROR = 'ERROR'
}

export enum LogCategory {
	PERFORMANCE = 'PERFORMANCE',
	SECURITY = 'SECURITY',
	SYSTEM = 'SYSTEM'
}

export class CampusLoggingService {
	constructor(private readonly db: PrismaClient) {}

	async log(data: {
		level: LogLevel;
		category: LogCategory;
		message: string;
		metadata?: any;
		campusId: string;
	}) {
		await this.db.$executeRaw`
			INSERT INTO campus_logs (
				campus_id, level, category, message, metadata, timestamp
			) VALUES (
				${data.campusId}, ${data.level}, ${data.category}, 
				${data.message}, ${data.metadata ? JSON.stringify(data.metadata) : null}, 
				${new Date()}
			)
		`;

		if (data.level === LogLevel.ERROR) {
			await this.db.$executeRaw`
				INSERT INTO error_tracker (
					campus_id, error_id, message, metadata, resolved
				) VALUES (
					${data.campusId}, ${Math.random().toString(36).substring(7)}, 
					${data.message}, ${data.metadata ? JSON.stringify(data.metadata) : null}, 
					false
				)
			`;
		}
	}

	async getLogs(campusId: string, level?: LogLevel, category?: LogCategory) {
		let query = this.db.$queryRaw`
			SELECT * FROM campus_logs 
			WHERE campus_id = ${campusId}
		`;

		if (level) {
			query = this.db.$queryRaw`
				SELECT * FROM campus_logs 
				WHERE campus_id = ${campusId} 
				AND level = ${level}
			`;
		}

		if (category) {
			query = this.db.$queryRaw`
				SELECT * FROM campus_logs 
				WHERE campus_id = ${campusId} 
				AND category = ${category}
			`;
		}

		if (level && category) {
			query = this.db.$queryRaw`
				SELECT * FROM campus_logs 
				WHERE campus_id = ${campusId} 
				AND level = ${level} 
				AND category = ${category}
			`;
		}

		return query;
	}

	async resolveError(errorId: string) {
		await this.db.$executeRaw`
			UPDATE error_tracker 
			SET resolved = true 
			WHERE error_id = ${errorId}
		`;
	}
}
