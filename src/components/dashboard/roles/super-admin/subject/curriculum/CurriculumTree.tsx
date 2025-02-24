import { useState } from "react";
import { api } from "@/utils/api";
import { CurriculumNode, NodeType, ActivityContent } from "@/types/curriculum";
import { Button } from "@/components/ui/button";
import { 
	Plus, 
	ChevronRight, 
	ChevronDown, 
	Book, 
	FileText, 
	ListTodo,
	Edit,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



interface TreeNodeProps {
	node: CurriculumNode;
	onSelect: (node: CurriculumNode) => void;
	selectedNodeId?: string;
	children?: CurriculumNode[];
	level: number;
}

const getNodeIcon = (type: NodeType) => {
	switch (type) {
		case 'CHAPTER':
			return <Book className="h-4 w-4 mr-2" />;
		case 'TOPIC':
			return <FileText className="h-4 w-4 mr-2" />;
		case 'SUBTOPIC':
			return <ListTodo className="h-4 w-4 mr-2" />;
	}
};

const getAddOptions = (nodeType: NodeType) => {
	switch (nodeType) {
		case 'CHAPTER':
			return [{ type: 'TOPIC' as NodeType, label: 'Add Topic' }];
		case 'TOPIC':
			return [{ type: 'SUBTOPIC' as NodeType, label: 'Add Subtopic' }];
		default:
			return [];
	}
};

const getFontSize = (type: NodeType) => {
	switch (type) {
		case 'CHAPTER':
			return 'text-base font-semibold';
		case 'TOPIC':
			return 'text-sm font-medium';
		case 'SUBTOPIC':
			return 'text-xs';
		default:
			return 'text-sm';
	}
};

const TreeNode: React.FC<TreeNodeProps> = ({ node, onSelect, selectedNodeId, children, level }) => {
	const [isExpanded, setIsExpanded] = useState(true);
	const hasChildren = children && children.length > 0;
	const utils = api.useContext();
	const createNode = api.curriculum.createNode.useMutation({
		onSuccess: () => {
			utils.curriculum.getNodes.invalidate();
		}
	});

	const handleAddChild = async (type: NodeType) => {
		await createNode.mutateAsync({
			title: `New ${type.toLowerCase()}`,
			type,
			parentId: node.id,
			order: (children?.length || 0) + 1,
			subjectId: node.subjectId,
		});
	};

	const addOptions = getAddOptions(node.type);

	return (
		<div>
			  <div 
				className={`
				  group relative flex items-center rounded-lg
				  ${selectedNodeId === node.id ? 'bg-accent' : 'hover:bg-accent/50'}
				  ${node.type === 'CHAPTER' ? 'bg-muted/30' : ''}
				  transition-colors
				`}
				style={{ 
				  paddingLeft: `${level * 1}rem`,
				  marginBottom: '0.5rem'
				}}
			  >
				<div 
				  className="flex-1 flex items-center min-h-[48px] cursor-pointer px-2 py-2 touch-manipulation"
				  onClick={() => onSelect(node)}
				>
				  <div className="flex items-center min-w-[32px]">
					{hasChildren && (
					  <Button 
						variant="ghost" 
						size="sm" 
						className="h-8 w-8 p-0"
						onClick={(e) => {
						  e.stopPropagation();
						  setIsExpanded(!isExpanded);
						}}
					  >
						{isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
					  </Button>
					)}
				  </div>
				  <div className="flex items-center gap-3 flex-1 min-w-0">
					{getNodeIcon(node.type)}
					<span className={`${getFontSize(node.type)} truncate flex-1`}>{node.title}</span>
				  </div>
				</div>

				{/* Mobile action buttons */}
				<div className="absolute right-2 flex items-center gap-1 lg:hidden">
				  <Button 
					variant="ghost" 
					size="sm" 
					className="h-8 w-8 p-0"
					onClick={(e) => {
					  e.stopPropagation();
					  onSelect(node);
					}}
				  >
					<Edit className="h-4 w-4" />
				  </Button>
				  {addOptions.length > 0 && (
					<Button 
					  variant="ghost" 
					  size="sm" 
					  className="h-8 w-8 p-0"
					  onClick={(e) => {
						e.stopPropagation();
						handleAddChild(addOptions[0].type);
					  }}
					>
					  <Plus className="h-4 w-4" />
					</Button>
				  )}
				</div>

				{/* Desktop action buttons */}
				<div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 lg:flex hidden">
				  <Button 
					variant="ghost" 
					size="sm" 
					className="h-8 w-8 p-0"
					onClick={(e) => {
					  e.stopPropagation();
					  onSelect(node);
					}}
				  >
					<Edit className="h-4 w-4" />
				  </Button>
				  {addOptions.length > 0 && (
					<DropdownMenu>
					  <DropdownMenuTrigger asChild>
						<Button 
						  variant="ghost" 
						  size="sm" 
						  className="h-8 w-8 p-0"
						  onClick={(e) => e.stopPropagation()}
						>
						  <Plus className="h-4 w-4" />
						</Button>
					  </DropdownMenuTrigger>
					  <DropdownMenuContent align="end" className="w-[200px]">
						{addOptions.map(({ type, label }) => (
						  <DropdownMenuItem 
							key={type} 
							onClick={() => handleAddChild(type)}
							className="flex items-center gap-3 p-3"
						  >
							{getNodeIcon(type)}
							<span>{label}</span>
						  </DropdownMenuItem>
						))}
					  </DropdownMenuContent>
					</DropdownMenu>
				  )}
				</div>
			</div>

			{hasChildren && isExpanded && (
				<div 
					className="border-l-2 border-border ml-4"
					style={{ marginLeft: `${level * 1 + 1}rem` }}
				>
					{children.map((child) => (
						<TreeNode
							key={child.id}
							node={child}
							onSelect={onSelect}
							selectedNodeId={selectedNodeId}
							children={child.children}
							level={level + 1}
						/>
					))}
				</div>
			)}
		</div>
	);

};

interface CurriculumTreeProps {
	subjectId: string;
	onNodeSelect: (node: CurriculumNode) => void;
}

export const CurriculumTree: React.FC<CurriculumTreeProps> = ({
	subjectId,
	onNodeSelect,
}) => {
	const [selectedNodeId, setSelectedNodeId] = useState<string>();
	const { data: nodes, refetch } = api.curriculum.getNodes.useQuery({ 
		subjectId 
	}, {
		select: (data): CurriculumNode[] => {
			if (!data) return [];
			return data.map(node => ({
				...node,
				description: node.description || undefined,
				parentId: node.parentId || undefined,
				resources: node.resources.map(resource => ({
					...resource,
					fileInfo: resource.fileInfo && typeof resource.fileInfo === 'object' ? {
						name: String((resource.fileInfo as any).name || ''),
						size: Number((resource.fileInfo as any).size || 0),
						type: String((resource.fileInfo as any).type || ''),
						url: (resource.fileInfo as any).url || undefined
					} : undefined
				})),
				activities: node.activities.map(activity => ({
					...activity,
					content: typeof activity.content === 'object' ? 
						activity.content as unknown as ActivityContent : 
						{ questions: [] }
				})),
				children: undefined
			}));
		}
	});
	const createNode = api.curriculum.createNode.useMutation({
		onSuccess: () => refetch(),
	});

	const handleNodeSelect = (node: CurriculumNode) => {
		setSelectedNodeId(node.id);
		onNodeSelect(node);
	};

	const handleAddFirstChapter = async () => {
		try {
			const newNode = await createNode.mutateAsync({
				title: "First Chapter",
				type: "CHAPTER" as const,
				order: 1,
				subjectId,
			});
			if (newNode) {
				const processedNode: CurriculumNode = {
					...newNode,
					description: newNode.description || undefined,
					parentId: newNode.parentId || undefined,
					resources: newNode.resources.map(resource => ({
						...resource,
						fileInfo: resource.fileInfo && typeof resource.fileInfo === 'object' ? {
							name: String((resource.fileInfo as any).name || ''),
							size: Number((resource.fileInfo as any).size || 0),
							type: String((resource.fileInfo as any).type || ''),
							url: (resource.fileInfo as any).url || undefined
						} : undefined
					})),
					activities: newNode.activities.map(activity => ({
						...activity,
						content: typeof activity.content === 'object' ? 
							activity.content as unknown as ActivityContent : 
							{ questions: [] }
					})),
					children: undefined
				};
				setSelectedNodeId(processedNode.id);
				onNodeSelect(processedNode);
			}
		} catch (error) {
			console.error("Failed to create chapter:", error);
		}
	};

	const organizeNodes = (nodes: CurriculumNode[] = []): CurriculumNode[] => {
		const nodeMap = new Map<string | null, CurriculumNode[]>();
		
		nodes.forEach(node => {
			const parentId = node.parentId ?? null;
			const parentNodes = nodeMap.get(parentId) || [];
			parentNodes.push(node);
			nodeMap.set(parentId, parentNodes);
		});

		const processLevel = (parentId: string | null): CurriculumNode[] => {
			const levelNodes = nodeMap.get(parentId) || [];
			return levelNodes
				.sort((a, b) => a.order - b.order)
				.map(node => ({
					...node,
					children: processLevel(node.id)
				}));
		};

		return processLevel(null);
	};

	const organizedNodes = organizeNodes(nodes || []);

	return (
		<div className="h-full">
			<div className="p-4 border-b flex items-center justify-between">
				<h3 className="text-sm font-medium">Curriculum Structure</h3>
				{organizedNodes && organizedNodes.length > 0 && (
					<Button 
						variant="ghost" 
						size="sm"
						onClick={handleAddFirstChapter}
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Chapter
					</Button>
				)}
			</div>

			<div className="p-4">
				<ScrollArea className="h-[calc(100vh-12rem)] pr-4">
					{organizedNodes && organizedNodes.length > 0 ? (
						organizedNodes.map((node) => (
							<TreeNode
								key={node.id}
								node={node}
								onSelect={handleNodeSelect}
								selectedNodeId={selectedNodeId}
								children={node.children}
								level={0}
							/>
						))
					) : (
						<div className="flex flex-col items-center justify-center p-8 text-center">
							<p className="text-muted-foreground mb-6">
								Start building your curriculum by adding your first chapter.
							</p>
							<Button 
								size="lg"
								onClick={handleAddFirstChapter}
								className="w-full max-w-sm h-12"
							>
								<Plus className="h-5 w-5 mr-2" />
								Add First Chapter
							</Button>
						</div>
					)}
				</ScrollArea>
			</div>
		</div>
	);
};