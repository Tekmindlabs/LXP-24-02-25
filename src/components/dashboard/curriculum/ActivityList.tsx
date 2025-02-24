'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActivityScope, UnifiedActivity } from '@/types/class-activity';

interface ActivityListProps {
	activities?: UnifiedActivity[];
	onEdit: (id: string) => void;
	scope: ActivityScope;
}

export function ActivityList({ activities, onEdit, scope }: ActivityListProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{activities?.map(activity => (
				<Card key={activity.id}>
					<CardHeader>
						<CardTitle>{activity.title}</CardTitle>
						<CardDescription>{activity.type}</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-gray-500">
							{activity.description}
						</p>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button
							variant="outline"
							size="sm"
							onClick={() => onEdit(activity.id)}
						>
							Edit
						</Button>
						{scope === ActivityScope.CURRICULUM && (
							<Badge>Curriculum</Badge>
						)}
					</CardFooter>
				</Card>
			))}
			{activities?.length === 0 && (
				<p className="text-gray-500 col-span-full text-center py-8">
					No activities found
				</p>
			)}
		</div>
	);
}

export default ActivityList;