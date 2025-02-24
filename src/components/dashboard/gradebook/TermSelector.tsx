import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TermSelectorProps {
	termId?: string;
	onTermChange: (termId: string) => void;
	terms?: Array<{
		id: string;
		name: string;
	}>;
}

export function TermSelector({ termId, onTermChange, terms = [] }: TermSelectorProps) {
	return (
		<div className="flex items-center gap-2">
			<label className="text-sm font-medium">Term:</label>
			<Select value={termId} onValueChange={onTermChange}>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Select Term" />
				</SelectTrigger>
				<SelectContent>
					{terms.map((term) => (
						<SelectItem key={term.id} value={term.id}>
							{term.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}