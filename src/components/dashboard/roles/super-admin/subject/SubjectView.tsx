import { api } from "@/utils/api";
import { CurriculumManager } from "./curriculum/CurriculumManager";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface SubjectViewProps {
	subjectId: string;
}

export const SubjectView: React.FC<SubjectViewProps> = ({ subjectId }) => {
	const { data: subject, isLoading } = api.subject.getById.useQuery(subjectId);

	if (isLoading) return <LoadingSpinner />;
	if (!subject) return <div>Subject not found</div>;

	return (
		<div className="flex flex-col h-full">
			<header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
				<div className="px-6 py-4">
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
						{subject.name}
					</h1>
				</div>
			</header>

			<main className="flex-1 overflow-y-auto">
				<CurriculumManager subjectId={subjectId} />
			</main>
		</div>
	);
};
