import { describe, it, expect, jest } from '@jest/globals';
import { CampusUserService } from '../services/CampusUserService';
import { withCampusPermission, withCampusRole, requireCampusPermission } from '../middleware/campus-permission';
import { CampusRole, CampusPermission } from '../../types/enums';
import { PrismaClient } from '@prisma/client';

jest.mock('../services/CampusUserService');

describe('Campus Permission Middleware', () => {
	const mockUserService = {
		getUserRole: jest.fn().mockImplementation(() => Promise.resolve(CampusRole.CAMPUS_ADMIN)),
		hasPermission: jest.fn().mockImplementation(() => Promise.resolve(true))
	} as jest.Mocked<CampusUserService>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('withCampusRole', () => {
		it('should return true when user has required role', async () => {
			(mockUserService.getUserRole as jest.Mock).mockResolvedValueOnce(CampusRole.CAMPUS_ADMIN);

			const result = await withCampusRole(
				mockUserService,
				'user-1',
				'campus-1',
				CampusRole.CAMPUS_MANAGER
			);

			expect(result).toBe(true);
			expect(mockUserService.getUserRole).toHaveBeenCalledWith('user-1', 'campus-1');
		});

		it('should return false when user has insufficient role', async () => {
			(mockUserService.getUserRole as jest.Mock).mockResolvedValueOnce(CampusRole.CAMPUS_TEACHER);

			const result = await withCampusRole(
				mockUserService,
				'user-1',
				'campus-1',
				CampusRole.CAMPUS_ADMIN
			);

			expect(result).toBe(false);
		});
	});

	describe('withCampusPermission', () => {
		it('should return true when user has required permission', async () => {
			(mockUserService.getUserRole as jest.Mock).mockResolvedValueOnce(CampusRole.CAMPUS_ADMIN);

			const result = await withCampusPermission(
				mockUserService,
				'user-1',
				'campus-1',
				CampusPermission.VIEW_CAMPUS
			);

			expect(result).toBe(true);
		});

		it('should throw error when user lacks permission', async () => {
			(mockUserService.getUserRole as jest.Mock).mockResolvedValueOnce(CampusRole.CAMPUS_STUDENT);

			await expect(
				withCampusPermission(
					mockUserService,
					'user-1',
					'campus-1',
					CampusPermission.MANAGE_CAMPUS
				)
			).rejects.toThrow('User lacks required permission');
		});
	});

	describe('requireCampusPermission', () => {
		const mockPrisma = {} as PrismaClient;
		
		it('should return true when user has permission', async () => {
			const middleware = requireCampusPermission(CampusPermission.VIEW_CAMPUS);
			const ctx = { prisma: mockPrisma, userId: 'user-1', campusId: 'campus-1' };
			
			const result = await middleware(ctx);
			expect(result).toBe(true);
		});

		it('should throw when missing context', async () => {
			const middleware = requireCampusPermission(CampusPermission.VIEW_CAMPUS);
			const ctx = { prisma: mockPrisma };
			
			await expect(middleware(ctx)).rejects.toThrow('Missing user or campus context');
		});
	});
});