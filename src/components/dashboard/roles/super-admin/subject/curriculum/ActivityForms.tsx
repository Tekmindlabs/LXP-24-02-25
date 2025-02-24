import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NovelEditor } from '@/components/ui/novel-editor';



import { QuizContent, AssignmentContent, DiscussionContent, ProjectContent, ReadingContent } from "@/types/curriculum";

interface FormProps<T> {
	content: T;
	onChange: (content: T) => void;
}

const QuizForm: React.FC<FormProps<QuizContent>> = ({ content, onChange }) => {
	const addQuestion = () => {
		onChange({
			questions: [
				...content.questions,
				{ question: "", options: [], correctAnswer: "" }
			]
		});
	};

	const updateQuestion = (index: number, question: string) => {
		const newQuestions = [...content.questions];
		newQuestions[index] = { ...newQuestions[index], question };
		onChange({ questions: newQuestions });
	};

	return (
		<div className="space-y-4">
			{content.questions.map((q, i) => (
				<div key={i} className="space-y-2">
					<Input
						value={q.question}
						onChange={(e) => updateQuestion(i, e.target.value)}
						placeholder="Question text"
					/>
				</div>
			))}
			<Button type="button" variant="outline" onClick={addQuestion}>
				Add Question
			</Button>
		</div>
	);
};

// Single export at the end
export {
	QuizForm,
	ReadingForm,
	AssignmentForm,
	DiscussionForm,
	ProjectForm
};


const ReadingForm: React.FC<FormProps<ReadingContent>> = ({ content, onChange }) => {
	return (
		<div className="space-y-4">
			<div className="min-h-[500px] w-full">
				<NovelEditor
					value={content.content || ''}
					onChange={(newContent) => onChange({
						...content,
						content: newContent
					})}
					placeholder="Start writing your reading content..."
					className="min-h-[500px]"
				/>
			</div>


			<div className="grid grid-cols-2 gap-4">
				<Input
					type="number"
					value={content.estimatedReadingTime || ""}
					onChange={(e) => onChange({ 
						...content, 
						estimatedReadingTime: Number(e.target.value) 
					})}
					placeholder="Estimated reading time (minutes)"
				/>
				<Input
					value={content.references?.join(", ") || ""}
					onChange={(e) => onChange({ 
						...content, 
						references: e.target.value.split(",").map(r => r.trim()) 
					})}
					placeholder="References (comma separated)"
				/>
			</div>
		</div>
	);
};


const AssignmentForm: React.FC<FormProps<AssignmentContent>> = ({ content, onChange }) => {

	return (
		<div className="space-y-4">
			<Textarea
				value={content.instructions || ""}
				onChange={(e) => onChange({ ...content, instructions: e.target.value })}
				placeholder="Assignment instructions"
				rows={4}
			/>
			<Input
				type="number"
				value={content.totalPoints || ""}
				onChange={(e) => onChange({ ...content, totalPoints: Number(e.target.value) })}
				placeholder="Total points"
			/>
		</div>
	);
};


const DiscussionForm: React.FC<FormProps<DiscussionContent>> = ({ content, onChange }) => {
	const addGuideline = () => {
		onChange({
			...content,
			guidelines: [...(content.guidelines || []), ""]
		});
	};

	const updateGuideline = (index: number, value: string) => {
		const newGuidelines = [...(content.guidelines || [])];
		newGuidelines[index] = value;
		onChange({ ...content, guidelines: newGuidelines });
	};

	return (
		<div className="space-y-4">
			<Input
				value={content.topic || ""}
				onChange={(e) => onChange({ ...content, topic: e.target.value })}
				placeholder="Discussion topic"
			/>
			<div className="space-y-2">
				{content.guidelines?.map((guideline, i) => (
					<Input
						key={i}
						value={guideline}
						onChange={(e) => updateGuideline(i, e.target.value)}
						placeholder={`Guideline ${i + 1}`}
					/>
				))}
			</div>
			<Button type="button" variant="outline" onClick={addGuideline}>
				Add Guideline
			</Button>
		</div>
	);
};


const ProjectForm: React.FC<FormProps<ProjectContent>> = ({ content, onChange }) => {
	const addObjective = () => {
		onChange({
			...content,
			objectives: [...(content.objectives || []), ""]
		});
	};

	const updateObjective = (index: number, value: string) => {
		const newObjectives = [...(content.objectives || [])];
		newObjectives[index] = value;
		onChange({ ...content, objectives: newObjectives });
	};

	return (
		<div className="space-y-4">
			<Textarea
				value={content.description || ""}
				onChange={(e) => onChange({ ...content, description: e.target.value })}
				placeholder="Project description"
				rows={4}
			/>
			<div className="space-y-2">
				{content.objectives?.map((objective, i) => (
					<Input
						key={i}
						value={objective}
						onChange={(e) => updateObjective(i, e.target.value)}
						placeholder={`Objective ${i + 1}`}
					/>
				))}
			</div>
			<Button type="button" variant="outline" onClick={addObjective}>
				Add Objective
			</Button>
		</div>
	);
};