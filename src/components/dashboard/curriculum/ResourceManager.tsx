'use client';

import { CurriculumResource } from '@/types/curriculum';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/utils/api';
import { FileIcon } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ResourceManagerProps {
	nodeId: string;
}

export function ResourceManager({ nodeId }: ResourceManagerProps) {
	const [showUpload, setShowUpload] = useState(false);
	const { data: resources } = api.curriculum.getResources.useQuery({ nodeId });

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">Resources</h3>
				<Button onClick={() => setShowUpload(true)}>Add Resource</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{resources?.map((resource: CurriculumResource) => (
					<Card key={resource.id}>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileIcon className="w-4 h-4" />
								{resource.title}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{resource.type}</p>
							<p>{resource.content}</p>
						</CardContent>
					</Card>
				))}
			</div>

			{showUpload && (
				<Dialog open={showUpload} onOpenChange={setShowUpload}>
					<DialogContent>
						<div className="p-4">
							<h2 className="text-lg font-semibold mb-4">Upload Resource</h2>
							{/* Resource upload form will be implemented */}
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}

export default ResourceManager;
