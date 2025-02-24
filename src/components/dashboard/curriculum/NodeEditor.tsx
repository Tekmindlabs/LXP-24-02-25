'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NovelEditor } from '@/components/ui/novel-editor';
import { CurriculumNode, NodeLearningContext } from '@/types/curriculum';
import { api } from '@/utils/api';

interface FormData {
	title: string;
	description: string;
	learningContext: NodeLearningContext;
}

export function NodeEditor({ 
	node, 
	onClose 
}: { 
	node: CurriculumNode; 
	onClose: () => void;
}) {
	const form = useForm<FormData>({
		defaultValues: {
			title: node?.title || '',
			description: node?.description || '',
			learningContext: node?.learningContext || {
				objectives: [],
				duration: '',
				prerequisites: [],
				keyTerms: [],
				outcomes: []
			}
		}
	});

	const { mutate: updateNode } = api.curriculum.updateNode.useMutation({
		onSuccess: () => {
			onClose();
		}
	});

	const onSubmit = (data: FormData) => {
		if (node) {
			updateNode({
				id: node.id,
				...data
			});
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Title</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
						</FormItem>
					)}
				/>

				<div className="flex justify-end gap-2">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit">Save Changes</Button>
				</div>
			</form>
		</Form>
	);
}

export default NodeEditor;
