import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { CampusValidationService } from '../services/CampusValidationService';
import { TRPCError } from '@trpc/server';
import { AttendanceStatus, Status } from '../../types/enums';

jest.mock('@prisma/client');

describe('CampusValidationService', () => {
	let prisma: jest.Mocked<PrismaClient>;
	let validationService: CampusValidationService;

	beforeEach(() => {
		prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
		validationService = new CampusValidationService(prisma);
	});

	describe('validateAttendanceRecord', () => {
		const validAttendanceRecord = {
			studentId: '123e4567-e89b-12d3-a456-426614174000',
			classId: '123e4567-e89b-12d3-a456-426614174001',
			date: new Date(),
			status: AttendanceStatus.PRESENT,
			notes: 'Present and participating'
		};

		it('should validate correct attendance record', async () => {
			prisma.enrollment.findFirst.mockResolvedValue({ status: Status.ACTIVE });
			prisma.classSchedule.findFirst.mockResolvedValue({
				startDate: new Date('2024-01-01'),
				endDate: new Date('2024-12-31')
			});

			const result = await validationService.validateAttendanceRecord(validAttendanceRecord);
			expect(result).toEqual(validAttendanceRecord);
		});

		it('should reject invalid attendance record format', async () => {
			const invalidRecord = {
				studentId: 'invalid-uuid',
				date: 'invalid-date'
			};

			await expect(validationService.validateAttendanceRecord(invalidRecord))
				.rejects.toThrow(TRPCError);
		});

		it('should reject attendance for non-enrolled student', async () => {
			prisma.enrollment.findFirst.mockResolvedValue(null);

			await expect(validationService.validateAttendanceRecord(validAttendanceRecord))
				.rejects.toThrow('Student is not enrolled in this class');
		});
	});

	describe('validateGradeRecord', () => {
		const validGradeRecord = {
			studentId: '123e4567-e89b-12d3-a456-426614174000',
			subjectId: '123e4567-e89b-12d3-a456-426614174001',
			grade: 85,
			termId: '123e4567-e89b-12d3-a456-426614174002',
			notes: 'Final exam grade'
		};

		it('should validate correct grade record', async () => {
			prisma.enrollment.findFirst.mockResolvedValue({ status: Status.ACTIVE });
			prisma.term.findUnique.mockResolvedValue({
				startDate: new Date('2024-01-01'),
				endDate: new Date('2024-12-31')
			});

			const result = await validationService.validateGradeRecord(validGradeRecord);
			expect(result).toEqual(validGradeRecord);
		});

		it('should reject invalid grade values', async () => {
			const invalidRecord = {
				...validGradeRecord,
				grade: 101 // Above maximum
			};

			await expect(validationService.validateGradeRecord(invalidRecord))
				.rejects.toThrow(TRPCError);
		});

		it('should reject grades for inactive term', async () => {
			prisma.enrollment.findFirst.mockResolvedValue({ status: Status.ACTIVE });
			prisma.term.findUnique.mockResolvedValue({
				startDate: new Date('2025-01-01'),
				endDate: new Date('2025-12-31')
			});

			await expect(validationService.validateGradeRecord(validGradeRecord))
				.rejects.toThrow('Term is not active');
		});
	});

	describe('validateTeacherAllocation', () => {
		const validAllocation = {
			teacherId: '123e4567-e89b-12d3-a456-426614174000',
			classId: '123e4567-e89b-12d3-a456-426614174001',
			role: 'PRIMARY',
			startDate: new Date(),
			endDate: new Date(Date.now() + 86400000) // Tomorrow
		};

		it('should validate correct teacher allocation', async () => {
			prisma.teacherClass.findFirst.mockResolvedValue(null);

			const result = await validationService.validateTeacherAllocation(validAllocation);
			expect(result).toEqual(validAllocation);
		});

		it('should reject overlapping allocations', async () => {
			prisma.teacherClass.findFirst.mockResolvedValue({
				id: 'existing-allocation'
			});

			await expect(validationService.validateTeacherAllocation(validAllocation))
				.rejects.toThrow('Teacher already allocated during this period');
		});

		it('should reject invalid date ranges', async () => {
			const invalidAllocation = {
				...validAllocation,
				endDate: new Date(Date.now() - 86400000) // Yesterday
			};

			await expect(validationService.validateTeacherAllocation(invalidAllocation))
				.rejects.toThrow(TRPCError);
		});
	});
});