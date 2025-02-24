import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GradeBookService } from '@/server/services/GradeBookService';
import { AssessmentService } from '@/server/services/AssessmentService';

const prisma = new PrismaClient();
const assessmentService = new AssessmentService(prisma);
const gradeBookService = new GradeBookService(prisma, assessmentService);


export async function GET(
	request: NextRequest,
	{ params }: { params: { classId: string } }
) {
	try {
		const { classId } = params;

		// First check if the class exists
		const classExists = await prisma.class.findUnique({
			where: { id: classId }
		});

		if (!classExists) {
			return NextResponse.json(
				{ error: 'Class not found' },
				{ status: 404 }
			);
		}

		const gradeBook = await prisma.gradeBook.findUnique({
			where: { classId },
			include: {
				subjectRecords: {
					include: {
						subject: true
					}
				},
				assessmentSystem: true,
				termStructure: {
					include: {
						academicTerms: {
							include: {
								assessmentPeriods: true
							}
						}
					}
				}
			},
		});

		if (!gradeBook) {
			return NextResponse.json(
				{ 
					error: 'Gradebook not found',
					message: 'Initialize the gradebook to start tracking grades'
				},
				{ status: 404 }
			);
		}

		return NextResponse.json(gradeBook);
	} catch (error) {
		console.error('Error fetching gradebook:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch gradebook' },
			{ status: 500 }
		);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: { classId: string } }
) {
	try {
		const { classId } = params;

		// Check if class exists
		const classExists = await prisma.class.findUnique({
			where: { id: classId },
			include: {
				classGroup: {
					include: {
						program: {
							include: {
								assessmentSystem: true,
								termStructures: true
							}
						}
					}
				}
			}
		});

		if (!classExists) {
			return NextResponse.json(
				{ error: 'Class not found' },
				{ status: 404 }
			);
		}

		// Check if program has required settings
		if (!classExists.classGroup.program.assessmentSystem) {
			return NextResponse.json(
				{ error: 'Program assessment system not configured' },
				{ status: 400 }
			);
		}

		// Check if gradebook already exists
		const existingGradeBook = await prisma.gradeBook.findUnique({
			where: { classId }
		});

		if (existingGradeBook) {
			return NextResponse.json(
				{ error: 'Gradebook already exists for this class' },
				{ status: 409 }
			);
		}

		await gradeBookService.initializeGradeBook(classId);
		
		const newGradeBook = await prisma.gradeBook.findUnique({
			where: { classId },
			include: {
				subjectRecords: {
					include: {
						subject: true
					}
				},
				assessmentSystem: true,
				termStructure: {
					include: {
						academicTerms: {
							include: {
								assessmentPeriods: true
							}
						}
					}
				}
			}
		});

		return NextResponse.json({ 
			message: 'Gradebook initialized successfully',
			data: newGradeBook
		});
	} catch (error) {
		console.error('Error initializing gradebook:', error);
		const errorMessage = error instanceof Error 
			? error.message 
			: 'Failed to initialize gradebook';
		
		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		);
	}
}