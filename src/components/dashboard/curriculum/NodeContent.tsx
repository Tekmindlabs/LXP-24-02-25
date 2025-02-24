'use client';

import { CurriculumNode } from '@/types/curriculum';

export function NodeContent({ node }: { node: CurriculumNode }) {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium mb-2">Learning Objectives</h3>
				{node.learningContext?.objectives ? (
					<div>
						{node.learningContext.objectives.map((objective, index) => (
							<div key={index} className="mb-2">{objective}</div>
						))}
					</div>
				) : (
					<p className="text-muted-foreground">No learning objectives defined</p>
				)}
			</div>

			<div>
				<h3 className="text-lg font-medium mb-2">Resources</h3>
				{node.resourceContext?.materials?.primary?.length ? (
					<div>
						{node.resourceContext.materials.primary.map((material, index) => (
							<div key={index} className="mb-2">{material}</div>
						))}
					</div>
				) : (
					<p className="text-muted-foreground">No resources available</p>
				)}
			</div>
		</div>
	);
}

export default NodeContent;
