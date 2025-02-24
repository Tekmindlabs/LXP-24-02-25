import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { 
	QuizForm, 
	AssignmentForm, 
	ProjectForm,
	ReadingForm 
} from './ActivityForms';
import { 
    QuizPreview, 
    AssignmentPreview, 
    ProjectPreview,
    ReadingPreview 
} from './previews';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  GraduationCap, 
  PenTool,
  ClipboardList,
  CheckSquare,
  Presentation
} from "lucide-react";
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
import { Plus, Trash2 } from "lucide-react";
import { ActivityType, ActivityContent, QuizContent, AssignmentContent, ProjectContent, ReadingContent } from "@/types/curriculum";
import { toast } from "@/hooks/use-toast";


// Type guards
const isQuizContent = (content: ActivityContent): content is QuizContent => {
	return 'questions' in content;
};

const isAssignmentContent = (content: ActivityContent): content is AssignmentContent => {
	return 'instructions' in content;
};

const isProjectContent = (content: ActivityContent): content is ProjectContent => {
	return 'description' in content;
};

const isReadingContent = (content: ActivityContent): content is ReadingContent => {
    return 'content' in content && !('questions' in content);
};



const getActivityIcon = (type: ActivityType) => {
	switch (type) {
		case 'QUIZ_MULTIPLE_CHOICE':
		case 'QUIZ_DRAG_DROP':
		case 'QUIZ_FILL_BLANKS':
		case 'QUIZ_MEMORY':
		case 'QUIZ_TRUE_FALSE':
			return <CheckSquare className="h-5 w-5" />;
		case 'CLASS_ASSIGNMENT':
			return <ClipboardList className="h-5 w-5" />;
		case 'CLASS_PROJECT':
			return <PenTool className="h-5 w-5" />;
		case 'CLASS_PRESENTATION':
			return <Presentation className="h-5 w-5" />;
		default:
			return <BookOpen className="h-5 w-5" />;
	}
};

interface ActivityFormProps {
	nodeId: string;
	onSuccess: () => void;
	onCancel: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ nodeId, onSuccess, onCancel }) => {
	const [title, setTitle] = useState("");
	const [type, setType] = useState<ActivityType>("QUIZ_MULTIPLE_CHOICE");
	const [isGraded, setIsGraded] = useState(false);
	const [content, setContent] = useState<ActivityContent>(() => {
		return { questions: [] };
	});


	useEffect(() => {
		switch (type) {
			case 'QUIZ_MULTIPLE_CHOICE':
			case 'QUIZ_DRAG_DROP':
			case 'QUIZ_FILL_BLANKS':
			case 'QUIZ_MEMORY':
			case 'QUIZ_TRUE_FALSE':
				setContent({ questions: [] });
				break;
			case 'CLASS_ASSIGNMENT':
			case 'CLASS_PROJECT':
				setContent({ instructions: '', totalPoints: 0 });
				break;
			case 'CLASS_PRESENTATION':
				setContent({ description: '', objectives: [] });
				break;
			case 'READING':
				setContent({ content: '', estimatedReadingTime: 0, references: [] });
				break;
			default:
				setContent({ questions: [] });
		}
	}, [type]);

	const createActivity = api.curriculum.createActivity.useMutation({
		onSuccess: () => {
			toast({
				title: "Activity created",
				description: "The activity has been created successfully."
			});
			onSuccess();
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive"
			});
		}
	});

	const handleSubmit = async () => {
		if (!title.trim()) {
			toast({
				title: "Error",
				description: "Title is required",
				variant: "destructive"
			});
			return;
		}

		// Validate content based on type
		let isValid = true;
		let errorMessage = '';

		if (['QUIZ_MULTIPLE_CHOICE', 'QUIZ_DRAG_DROP', 'QUIZ_FILL_BLANKS', 'QUIZ_MEMORY', 'QUIZ_TRUE_FALSE'].includes(type)) {
			if (isQuizContent(content) && !content.questions.length) {
				isValid = false;
				errorMessage = 'Add at least one question';
			}
		} else if (['CLASS_ASSIGNMENT', 'CLASS_PROJECT'].includes(type)) {
			if (isAssignmentContent(content) && !content.instructions.trim()) {
				isValid = false;
				errorMessage = 'Instructions are required';
			}
		} else if (type === 'CLASS_PRESENTATION') {
			if (isProjectContent(content) && !content.description.trim()) {
				isValid = false;
				errorMessage = 'Description is required';
			}
		} else if (type === 'READING') {
			if (isReadingContent(content) && !content.content.trim()) {
				isValid = false;
				errorMessage = 'Reading content is required';
			}
		}

		if (!isValid) {
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive"
			});
			return;
		}

		try {
			await createActivity.mutateAsync({
				title,
				type,
				content,
				isGraded,
				nodeId,
			});
		} catch (error) {
			console.error("Failed to create activity:", error);
		}
	};


	return (
		<Card>
			<CardContent className="space-y-4 pt-4">
				<Input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Activity title"
				/>
				<Select value={type} onValueChange={(value) => setType(value as ActivityType)}>
				  <SelectTrigger>
					<SelectValue placeholder="Select activity type" />
				  </SelectTrigger>
				  <SelectContent>
					<SelectItem value="READING">Reading Material</SelectItem>
					<SelectItem value="QUIZ_MULTIPLE_CHOICE">Multiple Choice Quiz</SelectItem>
					<SelectItem value="QUIZ_DRAG_DROP">Drag & Drop Quiz</SelectItem>
					<SelectItem value="QUIZ_FILL_BLANKS">Fill in the Blanks</SelectItem>
					<SelectItem value="QUIZ_MEMORY">Memory Quiz</SelectItem>
					<SelectItem value="QUIZ_TRUE_FALSE">True/False Quiz</SelectItem>
					<SelectItem value="CLASS_ASSIGNMENT">Assignment</SelectItem>
					<SelectItem value="CLASS_PROJECT">Project</SelectItem>
					<SelectItem value="CLASS_PRESENTATION">Presentation</SelectItem>
				  </SelectContent>
				</Select>
				{/* Render different content forms based on activity type */}
				{(type === 'QUIZ_MULTIPLE_CHOICE' || 
				  type === 'QUIZ_DRAG_DROP' || 
				  type === 'QUIZ_FILL_BLANKS' || 
				  type === 'QUIZ_MEMORY' || 
				  type === 'QUIZ_TRUE_FALSE') && (
				  <QuizForm 
					content={content as QuizContent} 
					onChange={(newContent) => setContent(newContent)} 
				  />
				)}
				{(type === 'CLASS_ASSIGNMENT' || type === 'CLASS_PROJECT') && (
				  <AssignmentForm 
					content={content as AssignmentContent} 
					onChange={(newContent) => setContent(newContent)} 
				  />
				)}
				{type === 'CLASS_PRESENTATION' && (
				  <ProjectForm 
					content={content as ProjectContent} 
					onChange={(newContent) => setContent(newContent)} 
				  />
				)}
				{type === 'READING' && (
					<ReadingForm 
						content={content as ReadingContent} 
						onChange={(newContent) => setContent(newContent)} 
					/>
				)}

				<div className="flex items-center space-x-2">
					<Switch
						checked={isGraded}
						onCheckedChange={setIsGraded}
					/>
					<label>Graded Activity</label>
				</div>
				<div className="flex justify-end space-x-2">
					<Button variant="outline" onClick={onCancel}>Cancel</Button>
					<Button onClick={handleSubmit} disabled={createActivity.status === 'pending'}>
						Add Activity
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

interface ActivityManagerProps {
	nodeId: string;
}

export const ActivityManager: React.FC<ActivityManagerProps> = ({ nodeId }) => {
	const [showForm, setShowForm] = useState(false);
	const { data: activities, isLoading, refetch } = api.curriculum.getActivities.useQuery(
		{ nodeId },
		{ enabled: !!nodeId }
	);

	const deleteActivity = api.curriculum.deleteActivity.useMutation({
		onSuccess: () => {
			toast({
				title: "Activity deleted",
				description: "The activity has been deleted successfully."
			});
			refetch();
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive"
			});
		}
	});

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this activity?")) {
			await deleteActivity.mutateAsync(id);
		}
	};

	if (isLoading) {
		return <div>Loading activities...</div>;
	}

	return (
    <div className="space-y-4">
      <div className="flex justify-between items-center sticky top-0 bg-background py-2">
        <h3 className="text-lg font-medium">Learning Activities</h3>
        <Sheet>
          <SheetTrigger asChild>
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh]">
            <ScrollArea className="h-full">
              <div className="py-6">
                <h3 className="text-lg font-medium mb-4">Add New Activity</h3>
                <ActivityForm
                  nodeId={nodeId}
                  onSuccess={() => {
                    setShowForm(false);
                    refetch();
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities?.map((activity) => (
          <Card 
            key={activity.id}
            className="group relative hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="rounded-lg bg-muted p-2">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-1">
                <CardTitle className="text-sm font-medium line-clamp-2">
                  {activity.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {activity.type.split('_').map(word => 
                    word.charAt(0) + word.slice(1).toLowerCase()
                  ).join(' ')}
                  {activity.isGraded && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Graded
                    </span>
                  )}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(activity.id)}
                disabled={deleteActivity.status === 'pending'}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
	);
};