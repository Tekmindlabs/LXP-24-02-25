import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface GradeInputProps {
	activityId: string;
	studentId: string;
	assessmentPeriodId: string;
	assessmentSystem: {
		type: string;
		maxGrade?: number;
	};
	onGradeSubmit?: () => void;
}

export function GradeInput({ 
	activityId, 
	studentId,
	assessmentPeriodId,
	assessmentSystem,
	onGradeSubmit 
}: GradeInputProps) {
	const [grade, setGrade] = useState<number>();
	const [submitting, setSubmitting] = useState(false);

	const handleGradeSubmit = async () => {
		if (!grade) return;

		setSubmitting(true);
		try {
			const response = await fetch('/api/activity-grades', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					activityId,
					studentId,
					grade,
					assessmentPeriodId
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to submit grade');
			}

			toast({
				title: 'Grade submitted successfully',
				variant: 'default',
			});

			onGradeSubmit?.();
		} catch (error) {
			console.error('Error submitting grade:', error);
			toast({
				title: 'Failed to submit grade',
				variant: 'destructive',
			});
		} finally {
			setSubmitting(false);
		}
	};

	const validateGrade = (value: string) => {
		const numValue = Number(value);
		if (assessmentSystem.maxGrade && numValue > assessmentSystem.maxGrade) {
			return;
		}
		if (numValue < 0) {
			return;
		}
		setGrade(numValue);
	};

	return (
		<div className="flex items-center gap-2">
			<Input
				type="number"
				value={grade ?? ''}
				onChange={(e) => validateGrade(e.target.value)}
				placeholder="Enter grade"
				className="w-24"
				min={0}
				max={assessmentSystem.maxGrade}
			/>
			<Button 
				onClick={handleGradeSubmit} 
				disabled={submitting || !grade}
			>
				Save Grade
			</Button>
		</div>
	);
}