import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { CampusAttendanceService } from '../services/CampusAttendanceService';
import { CampusUserService } from '../services/CampusUserService';
import { AttendanceStatus } from '@prisma/client';
import { CampusPermission } from '../../types/enums';

jest.mock('@prisma/client');
jest.mock('../services/CampusUserService');

describe('CampusAttendanceService', () => {
	let prisma: jest.Mocked<PrismaClient>;
	let userService: jest.Mocked<CampusUserService>;
	let attendanceService: CampusAttendanceService;

	beforeEach(() => {
		prisma = {
			attendance: {
				create: jest.fn(),
				update: jest.fn(),
				findUnique: jest.fn(),
				findMany: jest.fn()
			},
			attendanceAudit: {
				create: jest.fn()
			},
			$transaction: jest.fn()
		} as unknown as jest.Mocked<PrismaClient>;
		
		userService = {
			hasPermission: jest.fn()
		} as unknown as jest.Mocked<CampusUserService>;
		
		attendanceService = new CampusAttendanceService(prisma, userService);
	});

	describe('recordAttendance', () => {
		it('should record attendance when user has permission', async () => {
			const mockRecords = [
				{
					studentId: 'student-1',
					status: AttendanceStatus.PRESENT,
					notes: 'On time'
				}
			];

			userService.hasPermission.mockResolvedValue(true);
			prisma.$transaction.mockResolvedValue([{ id: 'attendance-1' }]);

			await attendanceService.recordAttendance(
				'user-1',
				'campus-1',
				'class-1',
				new Date(),
				mockRecords
			);

			expect(prisma.$transaction).toHaveBeenCalled();
		});

		it('should throw error when user lacks permission', async () => {
			userService.hasPermission.mockResolvedValue(false);

			await expect(attendanceService.recordAttendance(
				'user-1',
				'campus-1',
				'class-1',
				new Date(),
				[]
			)).rejects.toThrow('User does not have permission to record attendance');
		});
	});

	describe('updateAttendance', () => {
		it('should update attendance when user has permission', async () => {
			userService.hasPermission.mockResolvedValue(true);
			prisma.attendance.findUnique.mockResolvedValue({
				id: 'attendance-1',
				status: AttendanceStatus.PRESENT
			} as any);
			prisma.attendance.update.mockResolvedValue({ id: 'attendance-1' } as any);

			await attendanceService.updateAttendance(
				'user-1',
				'campus-1',
				'attendance-1',
				AttendanceStatus.LATE,
				'Late arrival'
			);

			expect(prisma.attendance.update).toHaveBeenCalledWith({
				where: { id: 'attendance-1' },
				data: expect.objectContaining({
					status: AttendanceStatus.LATE,
					notes: 'Late arrival'
				})
			});
		});
	});

	describe('getAttendanceByClass', () => {
		it('should return class attendance when user has permission', async () => {
			const mockAttendance = [
				{
					id: 'attendance-1',
					studentId: 'student-1',
					status: AttendanceStatus.PRESENT,
					date: new Date(),
					student: {
						user: { id: 'student-1', name: 'Student 1' }
					}
				}
			];

			userService.hasPermission.mockResolvedValue(true);
			prisma.attendance.findMany.mockResolvedValue(mockAttendance as any);

			const result = await attendanceService.getAttendanceByClass(
				'user-1',
				'campus-1',
				'class-1',
				new Date(),
				new Date()
			);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe('attendance-1');
		});
	});

	describe('getStudentAttendance', () => {
		it('should return student attendance when user has permission', async () => {
			const mockAttendance = [
				{
					id: 'attendance-1',
					classId: 'class-1',
					class: { name: 'Math Class' },
					status: AttendanceStatus.PRESENT,
					date: new Date(),
					markedBy: { id: 'teacher-1', name: 'Teacher 1' }
				}
			];

			userService.hasPermission.mockResolvedValue(true);
			prisma.campusAttendance.findMany.mockResolvedValue(mockAttendance);

			const result = await attendanceService.getStudentAttendance(
				'user-1',
				'campus-1',
				'student-1',
				new Date(),
				new Date()
			);

			expect(result).toHaveLength(1);
			expect(result[0].classId).toBe('class-1');
		});
	});
});