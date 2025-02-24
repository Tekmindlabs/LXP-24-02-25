import { PrismaClient } from "@prisma/client";
import { CampusLoggingService, LogLevel, LogCategory } from "../services/CampusLoggingService";
import { jest } from '@jest/globals';
import { Sql } from "@prisma/client/runtime/library";

describe('CampusLoggingService', () => {
	const mockExecuteRaw = jest.fn().mockResolvedValue([1]);
	const mockQueryRaw = jest.fn();
	
	const prisma = {
		$executeRaw: (strings: Sql, ...values: any[]) => mockExecuteRaw(strings, ...values),
		$queryRaw: (strings: Sql, ...values: any[]) => mockQueryRaw(strings, ...values)
	} as unknown as PrismaClient;

	const loggingService = new CampusLoggingService(prisma);

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('log', () => {
		it('should create a log entry', async () => {
			const logEntry = {
				level: LogLevel.INFO,
				category: LogCategory.SYSTEM,
				message: 'Test log',
				metadata: { test: true },
				campusId: 'campus-1'
			};

			await loggingService.log(logEntry);

			expect(mockExecuteRaw).toHaveBeenCalled();
		});

		it('should create error tracker entry for errors', async () => {
			const errorEntry = {
				level: LogLevel.ERROR,
				category: LogCategory.SYSTEM,
				message: 'Test error',
				metadata: { error: true },
				campusId: 'campus-1'
			};

			await loggingService.log(errorEntry);

			expect(mockExecuteRaw).toHaveBeenCalledTimes(2);
		});
	});

	describe('getLogs', () => {
		it('should get logs by campus', async () => {
			const mockLogs = [
				{
					id: '1',
					campusId: 'campus-1',
					level: LogLevel.INFO,
					category: LogCategory.SYSTEM,
					message: 'Test log',
					timestamp: new Date()
				}
			];

			mockQueryRaw.mockResolvedValueOnce(mockLogs);

			const result = await loggingService.getLogs('campus-1');

			expect(result).toEqual(mockLogs);
		});

		it('should get logs by level and category', async () => {
			const mockLogs = [
				{
					id: '1',
					campusId: 'campus-1',
					level: LogLevel.ERROR,
					category: LogCategory.SYSTEM,
					message: 'Test error',
					timestamp: new Date()
				}
			];

			mockQueryRaw.mockResolvedValueOnce(mockLogs);

			const result = await loggingService.getLogs('campus-1', LogLevel.ERROR, LogCategory.SYSTEM);

			expect(result).toEqual(mockLogs);
		});
	});

	describe('resolveError', () => {
		it('should mark error as resolved', async () => {
			await loggingService.resolveError('error-1');

			expect(mockExecuteRaw).toHaveBeenCalled();
		});
	});
});
