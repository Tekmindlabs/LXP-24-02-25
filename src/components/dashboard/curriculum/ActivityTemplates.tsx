'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityScope, UnifiedActivity } from '@/types/class-activity';
import { api } from '@/utils/api';

interface ActivityTemplatesProps {
	subjectId: string;
	onSelect: (templateId: string) => void;
}

export function ActivityTemplates({ subjectId, onSelect }: ActivityTemplatesProps) {
	const { data: templates } = api.activity.getAll.useQuery({
		subjectId,
		isTemplate: true,
		scope: ActivityScope.CURRICULUM
	});

	return (
		<div>
			<h2 className="text-2xl font-bold mb-4">Activity Templates</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{templates?.map(template => (
					<Card key={template.id}>
						<CardHeader>
							<CardTitle>{template.title}</CardTitle>
							<CardDescription>{template.type}</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-500">
								{template.description}
							</p>
						</CardContent>
						<CardFooter>
							<Button 
								onClick={() => onSelect(template.id)}
								className="w-full"
							>
								Use Template
							</Button>
						</CardFooter>
					</Card>
				))}
				{templates?.length === 0 && (
					<p className="text-gray-500 col-span-full text-center py-8">
						No templates available
					</p>
				)}
			</div>
		</div>
	);
}

export default ActivityTemplates;