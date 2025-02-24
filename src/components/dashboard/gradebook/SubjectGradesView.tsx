import { Table } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface SubjectGradesViewProps {
	classId: string;
	termId?: string;
	subjectId?: string;
}

interface SubjectGrade {
	subjectId: string;
	subjectName: string;
	finalGrade: number;
	percentage: number;
	isPassing: boolean;
	gradePoints: number;
}

export function SubjectGradesView({ classId, termId, subjectId }: SubjectGradesViewProps) {
	const [grades, setGrades] = useState<SubjectGrade[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (termId) {
			fetchGrades();
		}
	}, [classId, termId, subjectId]);

	const fetchGrades = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`/api/gradebook/${classId}/grades?termId=${termId}${subjectId ? `&subjectId=${subjectId}` : ''}`
			);
			if (!response.ok) throw new Error('Failed to fetch grades');
			const data = await response.json();
			setGrades(data);
		} catch (error) {
			console.error('Error fetching grades:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-32">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<Card className="p-4">
			<Table>
				<thead>
					<tr>
						<th>Subject</th>
						<th>Grade</th>
						<th>Percentage</th>
						<th>Status</th>
						<th>Grade Points</th>
					</tr>
				</thead>
				<tbody>
					{grades.map((grade) => (
						<tr key={grade.subjectId}>
							<td>{grade.subjectName}</td>
							<td>{grade.finalGrade.toFixed(2)}</td>
							<td>{grade.percentage.toFixed(1)}%</td>
							<td>
								<span className={grade.isPassing ? 'text-green-500' : 'text-red-500'}>
									{grade.isPassing ? 'Passed' : 'Failed'}
								</span>
							</td>
							<td>{grade.gradePoints.toFixed(2)}</td>
						</tr>
					))}
				</tbody>
			</Table>
		</Card>
	);
}