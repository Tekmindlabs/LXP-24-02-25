import { CurriculumNode } from "@/types/curriculum";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NodeViewProps {
	node: CurriculumNode;
}

export const NodeView: React.FC<NodeViewProps> = ({ node }) => {
	const hasObjectives = node.learningContext?.objectives && node.learningContext.objectives.length > 0;
	const hasPrerequisites = node.learningContext?.prerequisites && node.learningContext.prerequisites.length > 0;
	const hasKeyTerms = node.learningContext?.keyTerms && node.learningContext.keyTerms.length > 0;
	const hasOutcomes = node.learningContext?.outcomes && node.learningContext.outcomes.length > 0;
	const hasPrimaryMaterials = node.resourceContext?.materials?.primary && node.resourceContext.materials.primary.length > 0;
	const hasSupplementaryMaterials = node.resourceContext?.materials?.supplementary && node.resourceContext.materials.supplementary.length > 0;
	const hasReferences = node.resourceContext?.references && node.resourceContext.references.length > 0;
	const hasMethods = node.assessmentContext?.methods && node.assessmentContext.methods.length > 0;
	const hasCriteria = node.assessmentContext?.criteria && node.assessmentContext.criteria.length > 0;

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-semibold mb-2">{node.title}</h2>
				{node.description && (
					<p className="text-muted-foreground">{node.description}</p>
				)}
			</div>

			{node.learningContext && (
				<Card>
					<CardHeader>
						<CardTitle>Learning Context</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{hasObjectives && (
							<div>
								<h3 className="text-sm font-medium mb-2">Learning Objectives</h3>
								<ul className="list-disc pl-4 space-y-1">
									{node.learningContext.objectives.map((objective, i) => (
										<li key={i} className="text-sm">{objective}</li>
									))}
								</ul>
							</div>
						)}
						{node.learningContext.duration && (
							<div>
								<h3 className="text-sm font-medium mb-2">Duration</h3>
								<p className="text-sm">{node.learningContext.duration}</p>
							</div>
						)}
						{hasPrerequisites && (
							<div>
								<h3 className="text-sm font-medium mb-2">Prerequisites</h3>
								<ul className="list-disc pl-4 space-y-1">
									{node.learningContext.prerequisites.map((prereq, i) => (
										<li key={i} className="text-sm">{prereq}</li>
									))}
								</ul>
							</div>
						)}
						{hasKeyTerms && (
							<div>
								<h3 className="text-sm font-medium mb-2">Key Terms</h3>
								<ul className="list-disc pl-4 space-y-1">
									{node.learningContext.keyTerms.map((term, i) => (
										<li key={i} className="text-sm">{term}</li>
									))}
								</ul>
							</div>
						)}
						{hasOutcomes && (
							<div>
								<h3 className="text-sm font-medium mb-2">Learning Outcomes</h3>
								<ul className="list-disc pl-4 space-y-1">
									{node.learningContext.outcomes.map((outcome, i) => (
										<li key={i} className="text-sm">{outcome}</li>
									))}
								</ul>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{node.resourceContext && (
				<Card>
					<CardHeader>
						<CardTitle>Resources</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{hasPrimaryMaterials && (
							<div>
								<h3 className="text-sm font-medium mb-2">Primary Materials</h3>
								<ul className="list-disc pl-4 space-y-1">
									{node.resourceContext.materials.primary.map((material, i) => (
										<li key={i} className="text-sm">{material}</li>
									))}
								</ul>
							</div>
						)}
						{hasSupplementaryMaterials && (
							<div>
								<h3 className="text-sm font-medium mb-2">Supplementary Materials</h3>
								<ul className="list-disc pl-4 space-y-1">
									{node.resourceContext.materials.supplementary.map((material, i) => (
										<li key={i} className="text-sm">{material}</li>
									))}
								</ul>
							</div>
						)}
						{hasReferences && (
							<div>
								<h3 className="text-sm font-medium mb-2">References</h3>
								<ul className="list-disc pl-4 space-y-1">
									{node.resourceContext.references.map((ref, i) => (
										<li key={i} className="text-sm">{ref}</li>
									))}
								</ul>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{node.assessmentContext && (
				<Card>
					<CardHeader>
						<CardTitle>Assessment</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{hasMethods && (
							<div>
								<h3 className="text-sm font-medium mb-2">Assessment Methods</h3>
								<ul className="list-disc pl-4 space-y-1">
									{node.assessmentContext.methods.map((method, i) => (
										<li key={i} className="text-sm">{method}</li>
									))}
								</ul>
							</div>
						)}
						{hasCriteria && (
							<div>
								<h3 className="text-sm font-medium mb-2">Assessment Criteria</h3>
								<ul className="list-disc pl-4 space-y-1">
									{node.assessmentContext.criteria.map((criterion, i) => (
										<li key={i} className="text-sm">{criterion}</li>
									))}
								</ul>
							</div>
						)}
						{node.assessmentContext.weightage !== undefined && (
							<div>
								<h3 className="text-sm font-medium mb-2">Weightage</h3>
								<p className="text-sm">{node.assessmentContext.weightage}%</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};