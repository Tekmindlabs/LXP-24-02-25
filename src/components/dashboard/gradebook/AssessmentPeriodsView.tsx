import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AssessmentPeriodsViewProps {
	termId?: string;
	subjectId?: string;
}

interface AssessmentPeriod {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
	weight: number;
	grades: {
		obtainedMarks: number;
		totalMarks: number;
		percentage: number;
		isPassing: boolean;
	};
}

export function AssessmentPeriodsView({ termId, subjectId }: AssessmentPeriodsViewProps) {
	const [periods, setPeriods] = useState<AssessmentPeriod[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (termId && subjectId) {
			fetchAssessmentPeriods();
		}
	}, [termId, subjectId]);

	const fetchAssessmentPeriods = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`/api/assessment-periods?termId=${termId}&subjectId=${subjectId}`
			);
			if (!response.ok) throw new Error('Failed to fetch assessment periods');
			const data = await response.json();
			setPeriods(data);
		} catch (error) {
			console.error('Error fetching assessment periods:', error);
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

	if (!termId || !subjectId) {
		return null;
	}

	return (
		<Card className="p-4">
			<h3 className="text-lg font-semibold mb-4">Assessment Periods</h3>
			<Table>
				<thead>
					<tr>
						<th>Period</th>
						<th>Duration</th>
						<th>Weight</th>
						<th>Marks</th>
						<th>Percentage</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{periods.map((period) => (
						<tr key={period.id}>
							<td>{period.name}</td>
							<td>
								{new Date(period.startDate).toLocaleDateString()} -{' '}
								{new Date(period.endDate).toLocaleDateString()}
							</td>
							<td>{period.weight}%</td>
							<td>
								{period.grades.obtainedMarks}/{period.grades.totalMarks}
							</td>
							<td>{period.grades.percentage.toFixed(1)}%</td>
							<td>
								<span
									className={
										period.grades.isPassing ? 'text-green-500' : 'text-red-500'
									}
								>
									{period.grades.isPassing ? 'Passed' : 'Failed'}
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</Table>
		</Card>
	);
}