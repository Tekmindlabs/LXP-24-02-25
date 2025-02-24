'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ArrowLeft } from 'lucide-react';
import { ActivityScope } from '@/types/class-activity';
import { CurriculumNode } from '@/types/curriculum';
import { api } from '@/utils/api';
import { CurriculumTree } from './CurriculumTree';
import { NodeContent } from './NodeContent';
import { ResourceManager } from './ResourceManager';
import { NodeEditor } from './NodeEditor';
import { UnifiedActivityManager } from './UnifiedActivityManager';

export function CurriculumManager({ subjectId }: { subjectId: string }) {

	const [selectedNode, setSelectedNode] = useState<CurriculumNode | null>(null);
	const [activeView, setActiveView] = useState<'content' | 'resources' | 'activities'>('content');
	const [showNodeEditor, setShowNodeEditor] = useState(false);
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	const { data: nodes } = api.curriculum.getNodes.useQuery({ subjectId });

	return (
		<div className="grid grid-cols-12 gap-4">
			{/* Mobile Sheet for Curriculum Tree */}
			<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
				<SheetTrigger asChild className="lg:hidden">
					<Button variant="outline">View Curriculum Tree</Button>
				</SheetTrigger>
				<SheetContent side="left" className="w-[300px] sm:w-[400px]">
					<CurriculumTree
						nodes={nodes}
						onNodeSelect={(node) => {
							setSelectedNode(node);
							setIsSheetOpen(false);
						}}
					/>
				</SheetContent>
			</Sheet>

			{/* Desktop Curriculum Tree */}
			<div className="hidden lg:block col-span-3">
				<CurriculumTree
					nodes={nodes}
					onNodeSelect={setSelectedNode}
				/>
			</div>

			{/* Content Area */}
			<div className="col-span-12 lg:col-span-9">
				{selectedNode ? (
					<>
						<div className="flex justify-between items-center mb-4">
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									onClick={() => setSelectedNode(null)}
								>
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back
								</Button>
								<h2 className="text-2xl font-bold">{selectedNode.title}</h2>
							</div>
							<Button onClick={() => setShowNodeEditor(true)}>
								Edit Node
							</Button>
						</div>

						<div className="mb-6">
							<Tabs defaultValue={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
								<TabsList>
									<TabsTrigger value="content">Content</TabsTrigger>
									<TabsTrigger value="resources">Resources</TabsTrigger>
									<TabsTrigger value="activities">Activities</TabsTrigger>
								</TabsList>

								<TabsContent value="content">
									<NodeContent node={selectedNode} />
								</TabsContent>

								<TabsContent value="resources">
									<ResourceManager nodeId={selectedNode.id} />
								</TabsContent>

								<TabsContent value="activities">
									<UnifiedActivityManager
										subjectId={subjectId}
										curriculumNodeId={selectedNode.id}
										scope={ActivityScope.CURRICULUM}
									/>
								</TabsContent>
							</Tabs>
						</div>

						{showNodeEditor && (
							<Dialog open={showNodeEditor} onOpenChange={setShowNodeEditor}>
								<DialogContent>
									<NodeEditor
										node={selectedNode}
										onClose={() => setShowNodeEditor(false)}
									/>
								</DialogContent>
							</Dialog>
						)}
					</>
				) : (
					<div className="text-center py-8 text-gray-500">
						Select a node to view content
					</div>
				)}
			</div>
		</div>
	);
}

export default CurriculumManager;