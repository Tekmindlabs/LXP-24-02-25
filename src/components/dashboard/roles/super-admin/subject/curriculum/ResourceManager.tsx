import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NovelEditor } from "@/components/ui/novel-editor";
import type { CurriculumResourceType } from ".prisma/client";
import { ResourceUpload } from "@/components/dashboard/curriculum/resource-upload";
import { ResourcePreview } from "@/components/dashboard/curriculum/resource-preview";
import { FileInfo, ResourceFileInfo } from "@/types/curriculum";





import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Plus, FileText, Video, Link, File, Trash2 } from "lucide-react";





interface ResourceFormProps {
	nodeId: string;
	onSuccess: () => void;
	onCancel: () => void;
}


const ResourceForm: React.FC<ResourceFormProps> = ({ nodeId, onSuccess, onCancel }) => {
	const [title, setTitle] = useState("");
	const [type, setType] = useState<CurriculumResourceType>("READING");
	const [content, setContent] = useState("");
	const [error, setError] = useState("");
	const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
	const utils = api.useContext();

	const createResource = api.curriculum.createResource.useMutation({
		onMutate: () => {
			setError("");
		},
		onSuccess: async () => {
			await utils.curriculum.getNode.invalidate();
			await utils.curriculum.getNodes.invalidate();
			setTitle("");
			setType("READING");
			setContent("");
			onSuccess();
		},
		onError: (error) => {
			setError(error.message || "Failed to save resource");
			console.error("Error creating resource:", error);
		}
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (createResource.status === 'pending') return;

		setError("");
		if (!title.trim()) {
			setError("Title is required");
			return;
		}
		if (!content.trim()) {
			setError("Content is required");
			return;
		}

		try {
			const data = {
				title: title.trim(),
				type,
				content: content.trim(),
				nodeId,
				fileInfo: fileInfo ? {
					size: fileInfo.size,
					mimeType: fileInfo.mimeType,
					createdAt: new Date(fileInfo.createdAt),
					updatedAt: new Date(fileInfo.updatedAt),
					publicUrl: fileInfo.publicUrl
				} as ResourceFileInfo : undefined
			};
			console.log('Submitting resource:', data);
			await createResource.mutateAsync(data);
		} catch (error) {
			console.error("Error in handleSubmit:", error);
		}
	};


	const renderContentInput = () => {
		switch (type) {
			case "READING":
				return (
					<div className="relative w-full border rounded-lg">
						<NovelEditor
							value={content}
							onChange={setContent}
							placeholder="Start writing your content..."
							className="min-h-[400px]"
						/>
					</div>
				);

			case "VIDEO":
				return (
					<div className="space-y-4">
						<ResourceUpload
							type="VIDEO"
							onUploadComplete={(url, info: FileInfo) => {
								setContent(url);
								setFileInfo(info);
							}}

						/>
						{content && <ResourcePreview type="VIDEO" url={content} />}
					</div>
				);

			case "DOCUMENT":
				return (
					<div className="space-y-4">
						<ResourceUpload
							type="DOCUMENT"
							onUploadComplete={(url, info: FileInfo) => {
								setContent(url);
								setFileInfo(info);
							}}

						/>
						{content && <ResourcePreview type="DOCUMENT" url={content} mimeType={fileInfo?.mimeType} />}
					</div>
				);

			case "URL":
				return (
					<Input
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="Enter URL"
					/>
				);

			default:
				return null;
		}
	};

	return (
		<Card className="relative">
			<CardContent className="space-y-4 pt-4">
				{error && (
					<div className="text-sm text-red-500 font-medium">
						{error}
					</div>
				)}
				<Input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Resource title"
					disabled={createResource.status === 'pending'}
				/>
				<Select 
					value={type} 
					onValueChange={(value) => setType(value as CurriculumResourceType)}
					disabled={createResource.status === 'pending'}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select resource type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="READING">Reading</SelectItem>
						<SelectItem value="VIDEO">Video</SelectItem>
						<SelectItem value="URL">URL</SelectItem>
						<SelectItem value="DOCUMENT">Document</SelectItem>
					</SelectContent>
				</Select>
				{renderContentInput()}
				<div className="flex justify-end space-x-2">
					<Button 
						variant="outline" 
						onClick={onCancel}
						disabled={createResource.status === 'pending'}
					>
						Cancel
					</Button>
					<Button 
						onClick={handleSubmit} 
						disabled={createResource.status === 'pending'}
					>
						{createResource.status === 'pending' ? 'Saving...' : 'Save Resource'}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

const ResourceIcon: React.FC<{ type: CurriculumResourceType }> = ({ type }) => {
	switch (type) {
		case "READING":
			return <FileText className="h-4 w-4" />;
		case "VIDEO":
			return <Video className="h-4 w-4" />;
		case "URL":
			return <Link className="h-4 w-4" />;
		case "DOCUMENT":
			return <File className="h-4 w-4" />;
		default:
			return null;
	}
};

interface ResourceManagerProps {

	nodeId: string;
}

export const ResourceManager: React.FC<ResourceManagerProps> = ({ nodeId }) => {
	const [showForm, setShowForm] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const utils = api.useContext();

	const { data: node } = api.curriculum.getNode.useQuery({ 
		nodeId 
	}, {
		refetchOnWindowFocus: true,
		refetchOnMount: true,
		refetchOnReconnect: true,
		staleTime: 0,
	});

	const resources = node?.resources || [];

	const deleteResource = api.curriculum.deleteResource.useMutation({
		onSuccess: async () => {
			await utils.curriculum.getNode.invalidate();
			await utils.curriculum.getNodes.invalidate();
		}
	});

	const handleDelete = async (id: string) => {
		try {
			setIsLoading(true);
			await deleteResource.mutateAsync(id);
		} catch (error) {
			console.error("Error deleting resource:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (!node) {
		return <div>Loading resources...</div>;
	}

	return (
		<div className="space-y-4 h-full flex flex-col">
			<div className="flex justify-between items-center sticky top-0 bg-background py-2">
				<h3 className="text-lg font-medium">Learning Resources</h3>
				<Button onClick={() => setShowForm(true)} disabled={showForm || isLoading}>
					<Plus className="h-4 w-4 mr-2" />
					New Resource
				</Button>
			</div>

			<div className="flex-1 overflow-y-auto">
				{showForm && (
					<ResourceForm
						nodeId={nodeId}
						onSuccess={() => {
							setShowForm(false);
							utils.curriculum.getNodes.invalidate();
						}}
						onCancel={() => setShowForm(false)}
					/>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{resources.length === 0 && !showForm && (
						<div className="col-span-2 text-center text-muted-foreground py-8">
							No resources added yet. Click "New Resource" to add one.
						</div>
					)}
					{resources.map((resource) => (
						<Card key={resource.id}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<div className="flex items-center space-x-2">
									<ResourceIcon type={resource.type} />
									<CardTitle className="text-sm font-medium">
										{resource.title}
									</CardTitle>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleDelete(resource.id)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</CardHeader>
							<CardContent>
								{resource.type === "READING" ? (
									<div 
										className="prose prose-lg max-w-none dark:prose-invert prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-img:my-4 overflow-x-auto"
										dangerouslySetInnerHTML={{ __html: resource.content }}
									/>
								) : resource.type === "VIDEO" || resource.type === "DOCUMENT" ? (
									<ResourcePreview 
										type={resource.type} 
										url={resource.content} 
										mimeType={(resource.fileInfo as unknown as FileInfo)?.mimeType}
									/>
								) : (
									<CardDescription className="text-sm">
										{resource.content}
									</CardDescription>
								)}
							</CardContent>
						</Card>
					))}

				</div>
			</div>
		</div>
	);
};