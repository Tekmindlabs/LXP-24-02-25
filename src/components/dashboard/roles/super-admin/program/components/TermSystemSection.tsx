import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { TermSystemType } from "@/types/program";

const TERM_SYSTEM_TYPES = [
    'SEMESTER',
    'TERM',
    'QUARTER',
    'CUSTOM'
] as const;

interface TermSystemSectionProps {
	termSystem: {
		type: TermSystemType;
		terms: Array<{
			name: string;
			startDate: Date;
			endDate: Date;
		}>;
	};
	selectedProgram?: any;
	onTermSystemTypeChange: (type: TermSystemType) => void;
	onAddTerm: (type: TermSystemType) => void;
	onRemoveTerm: (index: number) => void;
	onTermChange: (index: number, field: string, value: any) => void;
}

export const TermSystemSection = ({
	termSystem,
	selectedProgram,
	onTermSystemTypeChange,
	onAddTerm,
	onRemoveTerm,
	onTermChange
}: TermSystemSectionProps) => {
	return (
		<div className="space-y-4 border p-4 rounded-lg">
			<h3 className="text-lg font-semibold">Term System</h3>
			<div>
				<Label>System Type</Label>
				<Select
					value={termSystem.type}
					onValueChange={(value) => onTermSystemTypeChange(value as TermSystemType)}
					disabled={!!selectedProgram && termSystem.terms.length > 0}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select term system" />
					</SelectTrigger>
					<SelectContent>
						{TERM_SYSTEM_TYPES.map((type) => (
							<SelectItem key={type} value={type}>
								{type.replace('_', ' ')}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				{termSystem.terms.map((term, index) => (
					<div key={index} className="space-y-2 border p-2 rounded">
						<div className="flex justify-between items-center">
							<h4 className="font-medium">{term.name}</h4>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onRemoveTerm(index)}
								className="text-red-500 hover:text-red-700"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<div>
								<Label>Start Date</Label>
								<Input
									type="date"
									value={term.startDate.toISOString().split('T')[0]}
									onChange={(e) => onTermChange(index, 'startDate', new Date(e.target.value))}
								/>
							</div>
							<div>
								<Label>End Date</Label>
								<Input
									type="date"
									value={term.endDate.toISOString().split('T')[0]}
									onChange={(e) => onTermChange(index, 'endDate', new Date(e.target.value))}
								/>
							</div>
						</div>
					</div>
				))}
				
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="w-full mt-2"
					onClick={() => onAddTerm(termSystem.type)}
				>
					<Plus className="h-4 w-4 mr-2" />
					Add
				</Button>
			</div>
		</div>
	);
};

