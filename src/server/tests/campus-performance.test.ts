import { PrismaClient } from "@prisma/client";
import { CampusPerformanceMonitor } from "../services/CampusPerformanceMonitor";
import { CampusLoggingService } from "../services/CampusLoggingService";
import { jest } from '@jest/globals';

describe('CampusPerformanceMonitor', () => {
	const mockExecuteRaw = jest.fn();
	const mockQueryRaw = jest.fn();
	
	const prisma = {
		$executeRaw: (...args: any[]) => mockExecuteRaw(args),
		$queryRaw: (...args: any[]) => mockQueryRaw(args)
	} as unknown as PrismaClient;
	
	const logger = {
		log: jest.fn()
	} as unknown as CampusLoggingService;

	const monitor = new CampusPerformanceMonitor(prisma, logger);

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('recordMetrics', () => {
		it('should record performance metrics', async () => {
			const metrics = {
				responseTime: 500,
				memoryUsage: 1024,
				cpuUsage: 50,
				activeUsers: 100,
				campusId: 'campus-1'
			};

			mockExecuteRaw.mockResolvedValue([1]);

			await monitor.recordMetrics('campus-1', metrics);

			expect(mockExecuteRaw).toHaveBeenCalled();
		});
	});

	describe('recordEndpointMetrics', () => {
		it('should record endpoint metrics', async () => {
			const metrics = {
				path: '/api/test',
				method: 'GET',
				totalRequests: 100,
				averageResponseTime: 200,
				errorRate: 0.02,
				campusId: 'campus-1'
			};

			mockExecuteRaw.mockResolvedValue([1]);

			await monitor.recordEndpointMetrics('campus-1', metrics);

			expect(mockExecuteRaw).toHaveBeenCalled();
		});
	});

	describe('getPerformanceMetrics', () => {
		it('should get performance metrics', async () => {
			const mockMetrics = [{
				id: '1',
				campusId: 'campus-1',
				responseTime: 500,
				memoryUsage: 1024,
				cpuUsage: 50,
				activeUsers: 100,
				timestamp: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			}];

			mockQueryRaw.mockResolvedValue(mockMetrics);

			const result = await monitor.getPerformanceMetrics(
				'campus-1',
				new Date(),
				new Date()
			);

			expect(result).toEqual(mockMetrics);
		});
	});

	describe('getEndpointMetrics', () => {
		it('should get endpoint metrics', async () => {
			const mockEndpoints = [{
				id: '1',
				campusId: 'campus-1',
				path: '/api/test',
				method: 'GET',
				totalRequests: 100,
				averageResponseTime: 200,
				errorRate: 0.02,
				lastUpdated: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			}];

			mockQueryRaw.mockResolvedValue(mockEndpoints);

			const result = await monitor.getEndpointMetrics('campus-1');

			expect(result).toEqual(mockEndpoints);
		});
	});
});
