'use client';

import { useState } from 'react';
import { api } from '@/utils/api';
import { ActivityScope } from '@/types/class-activity';
import { Button } from '@/components/ui/button';
import { ActivityList } from './ActivityList';
import { ActivityForm } from './ActivityForm';
import { ActivityTemplates } from './ActivityTemplates';
import { toast } from 'sonner';

export function UnifiedActivityManager({
	subjectId,
	classId,
	curriculumNodeId,
	scope = ActivityScope.CLASS
}: {
	subjectId: string;
	classId?: string;
	curriculumNodeId?: string;
	scope?: ActivityScope;
}) {
	const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
	const [view, setView] = useState<'list' | 'form' | 'templates'>('list');

	const { data: activities, refetch } = api.activity.getAll.useQuery({
		subjectId,
		classId,
		curriculumNodeId
	});

	const { mutate: cloneTemplate } = api.activity.cloneTemplate.useMutation({
		onSuccess: () => {
			toast.success('Template cloned successfully');
			refetch();
			setView('list');
		},
		onError: (error) => {
			toast.error(error.message);
		}
	});

	const handleTemplateSelect = (templateId: string) => {
		if (!classId) {
			toast.error('Class ID is required to clone template');
			return;
		}
		cloneTemplate({ templateId, classId });
	};

	return (
		<div>
			<div className="flex justify-between mb-4">
				<h2>Activities</h2>
				<div className="space-x-2">
					{classId && (
						<Button onClick={() => setView('templates')}>
							Browse Templates
						</Button>
					)}
					<Button onClick={() => setView('form')}>
						Create Activity
					</Button>
				</div>
			</div>

			{view === 'list' && (
				<ActivityList
					activities={activities}
					onEdit={setSelectedActivity}
					scope={scope}
				/>
			)}

			{view === 'form' && (
				<ActivityForm
					activityId={selectedActivity || undefined}
					subjectId={subjectId}
					classId={classId}
					curriculumNodeId={curriculumNodeId}
					scope={scope}
					onClose={() => {
						setSelectedActivity(null);
						setView('list');
					}}
				/>
			)}

			{view === 'templates' && (
				<ActivityTemplates
					subjectId={subjectId}
					onSelect={handleTemplateSelect}
				/>
			)}
		</div>
	);
}

export default UnifiedActivityManager;
