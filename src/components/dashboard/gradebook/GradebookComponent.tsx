'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { TRPCClientError } from '@trpc/client';
import { SubjectTermGrade } from "@/types/gradebook";


interface GradeBookProps {
	classId: string;
}

export const GradebookComponent: React.FC<GradeBookProps> = ({ classId }) => {
	const [activeTerm, setActiveTerm] = useState<string>();

	const { data: gradeBook, isLoading, error, refetch } = api.class.getGradebook.useQuery(
		{ classId },
		{
			staleTime: 5 * 60 * 1000,
			enabled: !!classId,
			retry: 1
		}
	);

	useEffect(() => {
		if (error) {
			toast({
				title: "Error",
				description: error instanceof TRPCClientError ? error.message : 'Failed to load gradebook',
				variant: "destructive",
			});
		}
	}, [error]);




	useEffect(() => {
		if (gradeBook?.termStructure?.academicTerms?.[0]?.id) {
			setActiveTerm(gradeBook.termStructure.academicTerms[0].id);
		}
	}, [gradeBook]);




	const formatGrade = (grade: number | undefined, type: string, assessmentSystem: any) => {
		const numGrade = grade ?? 0;
		
		switch (type) {
			case 'CGPA':
				const gradePoint = assessmentSystem.cgpaConfig?.gradePoints?.find(
					(gp: any) => numGrade >= gp.minPercentage && numGrade <= gp.maxPercentage
				);
				return gradePoint 
					? `${gradePoint.letter} (${numGrade.toFixed(2)})` 
					: numGrade.toFixed(2);
				
			case 'MARKING_SCHEME':
				const markingScheme = assessmentSystem.markingSchemes?.[0];
				if (markingScheme) {
					const grade = markingScheme.gradingScale?.find(
						(g: any) => numGrade >= g.minPercentage && numGrade <= g.maxPercentage
					);
					return grade 
						? `${grade.grade} (${numGrade.toFixed(2)}%)` 
						: `${numGrade.toFixed(2)}%`;
				}
				return `${numGrade.toFixed(2)}%`;
				
			default:
				return `${numGrade.toFixed(2)}%`;
		}
	};

	const renderGradeTable = () => {
		if (!gradeBook || !activeTerm) return null;

		const activePeriods = gradeBook.termStructure.academicTerms
			.find((term: { id: string }) => term.id === activeTerm)
			?.assessmentPeriods || [];

		return (
			<Table>
				<thead>
					<tr>
						<th>Subject</th>
						{activePeriods.map((period: { id: string; name: string; weight: number }) => (
							<th key={period.id}>
								{period.name} ({period.weight}%)
							</th>
						))}
						<th>Final Grade</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{gradeBook.subjectRecords.map((record) => {
						const termGrades = (typeof record.termGrades === 'string' 
							? JSON.parse(record.termGrades) 
							: record.termGrades) as Record<string, SubjectTermGrade> || {};
						const termGrade = termGrades[activeTerm];

						if (!termGrade) return null;

						return (


							<tr key={record.id}>
								<td>{record.subject.name}</td>
								{activePeriods.map((period: { id: string }) => (
									<td key={period.id}>
										{formatGrade(
											termGrade.periodGrades?.[period.id]?.percentage,
											gradeBook.assessmentSystem.type,
											gradeBook.assessmentSystem
										)}
									</td>
								))}
								<td>
									{formatGrade(
										termGrade.finalGrade ? Number(termGrade.finalGrade) : undefined,
										gradeBook.assessmentSystem.type,
										gradeBook.assessmentSystem
									)}
								</td>
								<td>
									<span className={termGrade.isPassing ? 'text-green-500' : 'text-red-500'}>
										{termGrade.isPassing ? 'Passed' : 'Failed'}
									</span>
								</td>
							</tr>
						);
					})}
				</tbody>
			</Table>
		);
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-32">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (error) {
		return (
			<Card className="p-4">
				<div className="space-y-4">
					<p className="text-red-500">{error.message}</p>
					<Button onClick={() => refetch()}>Retry</Button>
				</div>
			</Card>
		);
	}

	if (!gradeBook) {
		return (
			<Card className="p-4">
				<div className="space-y-4">
					<p>No gradebook found for this class.</p>
					<Button onClick={() => refetch()}>
						Retry Loading Gradebook
					</Button>
				</div>
			</Card>
		);
	}


	return (
		<Card className="p-4">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold">Gradebook</h2>
				<Select value={activeTerm} onValueChange={setActiveTerm}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select Term" />
					</SelectTrigger>
					<SelectContent>
						{gradeBook?.termStructure?.academicTerms.map((term) => (
							<SelectItem key={term.id} value={term.id}>
								{term.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="overflow-x-auto">
				{renderGradeTable()}
			</div>
		</Card>
	);
};
