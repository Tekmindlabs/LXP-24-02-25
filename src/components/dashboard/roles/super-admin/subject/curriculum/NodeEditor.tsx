import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { CurriculumNode, NodeType, NodeLearningContext, NodeResourceContext, NodeAssessmentContext } from "@/types/curriculum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Bookmark, BookmarkPlus } from "lucide-react";

interface NodeEditorProps {
	node: CurriculumNode;
	onClose?: () => void;
}

export const NodeEditor: React.FC<NodeEditorProps> = ({ node, onClose }) => {
	const [title, setTitle] = useState(node.title);
	const [description, setDescription] = useState(node.description || "");
	const [type, setType] = useState<NodeType>(node.type);
	const [parentId, setParentId] = useState<string | undefined>(node.parentId);
	const [learningContext, setLearningContext] = useState<NodeLearningContext>(
		node.learningContext || {}
	);
	const [resourceContext, setResourceContext] = useState<NodeResourceContext>(
		node.resourceContext || {}
	);
	const [assessmentContext, setAssessmentContext] = useState<NodeAssessmentContext>(
		node.assessmentContext || {}
	);

	const utils = api.useContext();
	const { data: allNodes } = api.curriculum.getNodes.useQuery({ subjectId: node.subjectId });
	const updateNode = api.curriculum.updateNode.useMutation({
		onSuccess: () => {
			utils.curriculum.getNodes.invalidate();
		}
	});

	// Get available parent nodes based on current node type
	const getAvailableParents = () => {
		if (!allNodes) return [];
		switch (type) {
			case 'TOPIC':
				return allNodes.filter(n => n.type === 'CHAPTER' && n.id !== node.id);
			case 'SUBTOPIC':
				return allNodes.filter(n => n.type === 'TOPIC' && n.id !== node.id);
			default:
				return [];
		}
	};

	const getNodeIcon = (type: NodeType) => {
		switch (type) {
			case 'CHAPTER':
				return <BookOpen className="h-4 w-4" />;
			case 'TOPIC':
				return <Bookmark className="h-4 w-4" />;
			case 'SUBTOPIC':
				return <BookmarkPlus className="h-4 w-4" />;
		}
	};

	// Reset parent if type changes
	useEffect(() => {
		if (type === 'CHAPTER') {
			setParentId(undefined);
		}
	}, [type]);

	const handleSave = async () => {
		try {
			await updateNode.mutateAsync({
				id: node.id,
				title,
				description,
				type,
				parentId,
				learningContext,
				resourceContext,
				assessmentContext
			});
			onClose?.();
		} catch (error) {
			console.error("Failed to update node:", error);
		}
	};

	const handleCancel = () => {
		setTitle(node.title);
		setDescription(node.description || "");
		setType(node.type);
		setParentId(node.parentId);
		onClose?.();
	};

	const currentParent = allNodes?.find(n => n.id === parentId);

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-lg font-semibold">Edit Node</h2>
				<Badge variant="outline">{type}</Badge>
			</div>

			{currentParent && (
				<Alert>
					<AlertDescription className="flex items-center gap-2">
						Parent: {getNodeIcon(currentParent.type)}
						<span className="font-medium">{currentParent.title}</span>
					</AlertDescription>
				</Alert>
			)}

			<div className="space-y-4">
				<div className="space-y-2">
					<label className="text-sm font-medium">Title</label>
					<Input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Enter node title"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">Type</label>
					<Select value={type} onValueChange={(value) => setType(value as NodeType)}>
						<SelectTrigger>
							<SelectValue placeholder="Select node type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="CHAPTER">Chapter</SelectItem>
							<SelectItem value="TOPIC">Topic</SelectItem>
							<SelectItem value="SUBTOPIC">Subtopic</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{type !== 'CHAPTER' && (
					<div className="space-y-2">
						<label className="text-sm font-medium">Parent Node</label>
						<Select value={parentId} onValueChange={setParentId}>
							<SelectTrigger>
								<SelectValue placeholder="Select parent node" />
							</SelectTrigger>
							<SelectContent>
								{getAvailableParents().map((parent) => (
									<SelectItem key={parent.id} value={parent.id}>
										<div className="flex items-center gap-2">
											{getNodeIcon(parent.type)}
											{parent.title}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				<div className="space-y-2">
					<label className="text-sm font-medium">Description</label>
					<Textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Enter node description"
						rows={4}
					/>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Learning Context</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-sm font-medium">Learning Objectives</label>
							<Textarea
								value={learningContext.objectives?.join('\n') || ''}
								onChange={(e) => setLearningContext({
									...learningContext,
									objectives: e.target.value.split('\n').filter(Boolean)
								})}
								placeholder="Enter objectives (one per line)"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Duration</label>
							<Input
								value={learningContext.duration || ''}
								onChange={(e) => setLearningContext({
									...learningContext,
									duration: e.target.value
								})}
								placeholder="e.g., 2 hours"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Prerequisites</label>
							<Textarea
								value={learningContext.prerequisites?.join('\n') || ''}
								onChange={(e) => setLearningContext({
									...learningContext,
									prerequisites: e.target.value.split('\n').filter(Boolean)
								})}
								placeholder="Enter prerequisites (one per line)"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Key Terms</label>
							<Textarea
								value={learningContext.keyTerms?.join('\n') || ''}
								onChange={(e) => setLearningContext({
									...learningContext,
									keyTerms: e.target.value.split('\n').filter(Boolean)
								})}
								placeholder="Enter key terms (one per line)"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Learning Outcomes</label>
							<Textarea
								value={learningContext.outcomes?.join('\n') || ''}
								onChange={(e) => setLearningContext({
									...learningContext,
									outcomes: e.target.value.split('\n').filter(Boolean)
								})}
								placeholder="Enter learning outcomes (one per line)"
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Resource Context</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-sm font-medium">Primary Materials</label>
							<Textarea
								value={resourceContext.materials?.primary?.join('\n') || ''}
								onChange={(e) => setResourceContext({
									...resourceContext,
									materials: {
										...resourceContext.materials,
										primary: e.target.value.split('\n').filter(Boolean)
									}
								})}
								placeholder="Enter primary materials (one per line)"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Supplementary Materials</label>
							<Textarea
								value={resourceContext.materials?.supplementary?.join('\n') || ''}
								onChange={(e) => setResourceContext({
									...resourceContext,
									materials: {
										...resourceContext.materials,
										supplementary: e.target.value.split('\n').filter(Boolean)
									}
								})}
								placeholder="Enter supplementary materials (one per line)"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">References</label>
							<Textarea
								value={resourceContext.references?.join('\n') || ''}
								onChange={(e) => setResourceContext({
									...resourceContext,
									references: e.target.value.split('\n').filter(Boolean)
								})}
								placeholder="Enter references (one per line)"
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Assessment Context</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-sm font-medium">Assessment Methods</label>
							<Textarea
								value={assessmentContext.methods?.join('\n') || ''}
								onChange={(e) => setAssessmentContext({
									...assessmentContext,
									methods: e.target.value.split('\n').filter(Boolean)
								})}
								placeholder="Enter assessment methods (one per line)"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Assessment Criteria</label>
							<Textarea
								value={assessmentContext.criteria?.join('\n') || ''}
								onChange={(e) => setAssessmentContext({
									...assessmentContext,
									criteria: e.target.value.split('\n').filter(Boolean)
								})}
								placeholder="Enter assessment criteria (one per line)"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Weightage (%)</label>
							<Input
								type="number"
								value={assessmentContext.weightage || ''}
								onChange={(e) => setAssessmentContext({
									...assessmentContext,
									weightage: Number(e.target.value)
								})}
								placeholder="Enter weightage percentage"
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="flex gap-4 pt-4">
				<Button 
					variant="outline"
					onClick={handleCancel}
					className="flex-1"
				>
					Cancel
				</Button>
				<Button 
					onClick={handleSave} 
					disabled={updateNode.status === 'pending'}
					className="flex-1"
				>
					Save Changes
				</Button>
			</div>
		</div>

	);
};