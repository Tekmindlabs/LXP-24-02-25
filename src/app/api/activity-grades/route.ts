import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ActivityGradeService } from '@/server/services/ActivityGradeService';

const prisma = new PrismaClient();
const activityGradeService = new ActivityGradeService(prisma);

export async function POST(request: Request) {
	try {
		const data = await request.json();
		
		// Validate required fields
		if (!data.activityId || !data.studentId || !data.grade || !data.assessmentPeriodId) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		await activityGradeService.recordActivityGrade({
			activityId: data.activityId,
			studentId: data.studentId,
			grade: Number(data.grade),
			assessmentPeriodId: data.assessmentPeriodId
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error recording activity grade:', error);
		return NextResponse.json(
			{ error: 'Failed to record activity grade' },
			{ status: 500 }
		);
	}
}