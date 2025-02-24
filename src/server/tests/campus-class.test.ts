import { describe, it, expect, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { CampusClassService } from '../services/CampusClassService';
import { CampusUserService } from '../services/CampusUserService';
import { CampusPermission } from '../../types/enums';

jest.mock('@prisma/client');

describe('CampusClassService', () => {
	const mockQueryRaw = jest.fn();
	const mockExecuteRaw = jest.fn();

	const prisma = {
		$queryRaw: mockQueryRaw,
		$executeRaw: mockExecuteRaw,
		class: {
			findMany: jest.fn(),
			create: jest.fn(),
			update: jest.fn()
		}
	} as unknown as PrismaClient;

	const mockUserService = {
		hasPermission: jest.fn().mockResolvedValue(true)
	} as jest.Mocked<CampusUserService>;

	const classService = new CampusClassService(prisma, mockUserService);

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('createClass', () => {
		it('should create a class when user has permission', async () => {
			const mockResult = {
				id: 'class-1',
				name: 'Test Class',
				campusId: 'campus-1',
				classGroupId: 'group-1',
				capacity: 30,
				status: 'ACTIVE',
				createdAt: new Date(),
				updatedAt: new Date()
			};

			mockQueryRaw.mockResolvedValueOnce([mockResult]);

			const result = await classService.createClass(
				'user-1',
				'campus-1',
				{
					name: 'Test Class',
					classGroupId: 'group-1',
					capacity: 30
				}
			);

			expect(result).toEqual(mockResult);
			expect(mockUserService.hasPermission).toHaveBeenCalledWith(
				'user-1',
				'campus-1',
				CampusPermission.MANAGE_CAMPUS_CLASSES
			);
		});
	});

	describe('getClass', () => {
		it('should return class details when user has permission', async () => {
			const mockClass = {
				id: 'class-1',
				name: 'Test Class',
				campusId: 'campus-1',
				classGroupId: 'group-1',
				capacity: 30,
				status: 'ACTIVE',
				createdAt: new Date(),
				updatedAt: new Date()
			};

			mockQueryRaw.mockResolvedValueOnce([mockClass]);

			const result = await classService.getClass(
				'user-1',
				'campus-1',
				'class-1'
			);

			expect(result).toEqual(mockClass);
		});
	});

	describe('getClasses', () => {
		it('should return all classes for campus when user has permission', async () => {
			const mockClasses = [{
				id: 'class-1',
				name: 'Test Class 1',
				campusId: 'campus-1',
				classGroupId: 'group-1',
				capacity: 30,
				status: 'ACTIVE',
				createdAt: new Date(),
				updatedAt: new Date()
			}];

			mockQueryRaw.mockResolvedValueOnce(mockClasses);

			const result = await classService.getClasses(
				'user-1',
				'campus-1'
			);

			expect(result).toEqual(mockClasses);
		});
	});
});
