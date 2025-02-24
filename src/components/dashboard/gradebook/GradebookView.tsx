'use client';

import { useState, useEffect } from 'react';
import { TermSelector } from './TermSelector';
import { SubjectGradesView } from './SubjectGradesView';
import { AssessmentPeriodsView } from './AssessmentPeriodsView';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface GradebookViewProps {
	classId: string;
}

interface Term {
	id: string;
	name: string;
}

export function GradebookView({ classId }: GradebookViewProps) {
	const [activeTermId, setActiveTermId] = useState<string>();
	const [activeSubjectId, setActiveSubjectId] = useState<string>();
	const [terms, setTerms] = useState<Term[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchTerms();
	}, [classId]);

	const fetchTerms = async () => {
		try {
			const response = await fetch(`/api/terms?classId=${classId}`);
			if (!response.ok) throw new Error('Failed to fetch terms');
			const data = await response.json();
			setTerms(data);
			if (data.length > 0) {
				setActiveTermId(data[0].id);
			}
		} catch (error) {
			console.error('Error fetching terms:', error);
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
		<Card className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold">Gradebook</h2>
				<TermSelector 
					termId={activeTermId}
					onTermChange={setActiveTermId}
					terms={terms}
				/>
			</div>

			<div className="grid gap-6">
				<SubjectGradesView
					classId={classId}
					termId={activeTermId}
					subjectId={activeSubjectId}
				/>
				
				<AssessmentPeriodsView
					termId={activeTermId}
					subjectId={activeSubjectId}
				/>
			</div>
		</Card>
	);
}