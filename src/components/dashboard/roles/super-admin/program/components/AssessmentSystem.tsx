import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssessmentSystemType } from "@/types/assessment";
import { ProgramFormData } from "@/types/program";
import { defaultCGPAConfig, defaultRubric } from "@/constants/program";

interface GradeScale {
	grade: string;
	minPercentage: number;
	maxPercentage: number;
}

interface AssessmentSystemProps {
	assessmentSystem: {
		type: AssessmentSystemType;
		markingScheme?: {
			maxMarks: number;
			passingMarks: number;
			gradingScale: GradeScale[];
		};
		rubric?: typeof defaultRubric;
		cgpaConfig?: typeof defaultCGPAConfig;
	};
	onAssessmentSystemChange: (newAssessmentSystem: NonNullable<ProgramFormData['assessmentSystem']>) => void;
}

export const AssessmentSystem = ({ 
	assessmentSystem, 
	onAssessmentSystemChange 
}: AssessmentSystemProps) => {
	const handleAssessmentTypeChange = (type: AssessmentSystemType) => {
		const newAssessmentSystem = {
			type,
			markingScheme: type === AssessmentSystemType.MARKING_SCHEME 
				? {
					maxMarks: 100,
					passingMarks: 40,
					gradingScale: [
						{ grade: 'A', minPercentage: 80, maxPercentage: 100 },
						{ grade: 'B', minPercentage: 70, maxPercentage: 79 },
						{ grade: 'C', minPercentage: 60, maxPercentage: 69 },
						{ grade: 'D', minPercentage: 50, maxPercentage: 59 },
						{ grade: 'E', minPercentage: 40, maxPercentage: 49 },
						{ grade: 'F', minPercentage: 0, maxPercentage: 39 }
					]
				}
				: undefined,
			rubric: type === AssessmentSystemType.RUBRIC 
				? defaultRubric 
				: undefined,
			cgpaConfig: type === AssessmentSystemType.CGPA 
				? defaultCGPAConfig 
				: undefined
		};

		onAssessmentSystemChange(newAssessmentSystem);
	};

	const updateMarkingScheme = (field: keyof NonNullable<typeof assessmentSystem.markingScheme>, value: number) => {
		if (!assessmentSystem.markingScheme) return;

		onAssessmentSystemChange({
			...assessmentSystem,
			markingScheme: {
				...assessmentSystem.markingScheme,
				[field]: value
			}
		});
	};

	const updateGradingScale = (index: number, field: 'grade' | 'minPercentage' | 'maxPercentage', value: string | number) => {
		if (!assessmentSystem.markingScheme?.gradingScale) return;

		const updatedGradingScale = [...assessmentSystem.markingScheme.gradingScale];
		updatedGradingScale[index] = {
			...updatedGradingScale[index],
			[field]: value
		};

		onAssessmentSystemChange({
			...assessmentSystem,
			markingScheme: {
				...assessmentSystem.markingScheme,
				gradingScale: updatedGradingScale
			}
		});
	};

	return (
		<div className="space-y-4 border p-4 rounded-lg">
			<h3 className="text-lg font-semibold">Assessment System</h3>
			
			<div>
				<Label>Assessment Type</Label>
				<Select
					value={assessmentSystem.type}
					onValueChange={(value: AssessmentSystemType) => handleAssessmentTypeChange(value)}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select Assessment Type" />
					</SelectTrigger>
					<SelectContent>
						{Object.values(AssessmentSystemType).map((type) => (
							<SelectItem key={type} value={type}>
								{type.replace('_', ' ')}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{assessmentSystem.type === AssessmentSystemType.MARKING_SCHEME && assessmentSystem.markingScheme && (
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>Maximum Marks</Label>
							<Input
								type="number"
								value={assessmentSystem.markingScheme.maxMarks}
								onChange={(e) => updateMarkingScheme('maxMarks', Number(e.target.value))}
								min={0}
							/>
						</div>
						<div>
							<Label>Passing Marks</Label>
							<Input
								type="number"
								value={assessmentSystem.markingScheme.passingMarks}
								onChange={(e) => updateMarkingScheme('passingMarks', Number(e.target.value))}
								min={0}
								max={assessmentSystem.markingScheme.maxMarks}
							/>
						</div>
					</div>

					<div>
						<Label>Grading Scale</Label>
						{assessmentSystem.markingScheme.gradingScale.map((grade, index) => (
							<div key={index} className="grid grid-cols-3 gap-2 mt-2">
								<Input
									placeholder="Grade"
									value={grade.grade}
									onChange={(e) => updateGradingScale(index, 'grade', e.target.value)}
									maxLength={2}
								/>
								<Input
									type="number"
									placeholder="Min %"
									value={grade.minPercentage}
									onChange={(e) => updateGradingScale(index, 'minPercentage', Number(e.target.value))}
									min={0}
									max={100}
								/>
								<Input
									type="number"
									placeholder="Max %"
									value={grade.maxPercentage}
									onChange={(e) => updateGradingScale(index, 'maxPercentage', Number(e.target.value))}
									min={0}
									max={100}
								/>
							</div>
						))}
					</div>
				</div>
			)}

			{assessmentSystem.type === AssessmentSystemType.RUBRIC && (
				<div className="space-y-4">
					<div>
						<Label>Rubric Name</Label>
						<Input
							value={assessmentSystem.rubric?.name || ''}
							onChange={(e) => onAssessmentSystemChange({
								...assessmentSystem,
								rubric: {
									...assessmentSystem.rubric!,
									name: e.target.value
								}
							})}
						/>
					</div>

					<div>
						<Label>Criteria</Label>
						{assessmentSystem.rubric?.criteria.map((criterion, index) => (
							<div key={index} className="space-y-2 mt-2 p-2 border rounded">
								<Input
									placeholder="Criterion Name"
									value={criterion.name}
									onChange={(e) => {
										const newCriteria = [...assessmentSystem.rubric!.criteria];
										newCriteria[index] = { ...criterion, name: e.target.value };
										onAssessmentSystemChange({
											...assessmentSystem,
											rubric: {
												...assessmentSystem.rubric!,
												criteria: newCriteria
											}
										});
									}}
								/>
								
								<div className="space-y-2">
									{criterion.levels.map((level, levelIndex) => (
										<div key={levelIndex} className="grid grid-cols-2 gap-2">
											<Input
												placeholder="Level Name"
												value={level.name}
												onChange={(e) => {
													const newCriteria = [...assessmentSystem.rubric!.criteria];
													newCriteria[index].levels[levelIndex] = {
														...level,
														name: e.target.value
													};
													onAssessmentSystemChange({
														...assessmentSystem,
														rubric: {
															...assessmentSystem.rubric!,
															criteria: newCriteria
														}
													});
												}}
											/>
											<Input
												type="number"
												placeholder="Points"
												value={level.points}
												onChange={(e) => {
													const newCriteria = [...assessmentSystem.rubric!.criteria];
													newCriteria[index].levels[levelIndex] = {
														...level,
														points: Number(e.target.value)
													};
													onAssessmentSystemChange({
														...assessmentSystem,
														rubric: {
															...assessmentSystem.rubric!,
															criteria: newCriteria
														}
													});
												}}
											/>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{assessmentSystem.type === AssessmentSystemType.CGPA && (
				<div className="space-y-4">
					<div>
						<Label>Grade Points Configuration</Label>
						{assessmentSystem.cgpaConfig?.gradePoints.map((grade, index) => (
							<div key={index} className="grid grid-cols-4 gap-2 mt-2">
								<Input
									placeholder="Grade"
									value={grade.grade}
									onChange={(e) => {
										const newGradePoints = [...assessmentSystem.cgpaConfig!.gradePoints];
										newGradePoints[index] = { ...grade, grade: e.target.value };
										onAssessmentSystemChange({
											...assessmentSystem,
											cgpaConfig: {
												...assessmentSystem.cgpaConfig!,
												gradePoints: newGradePoints
											}
										});
									}}
								/>
								<Input
									type="number"
									placeholder="Points"
									value={grade.points}
									onChange={(e) => {
										const newGradePoints = [...assessmentSystem.cgpaConfig!.gradePoints];
										newGradePoints[index] = { ...grade, points: Number(e.target.value) };
										onAssessmentSystemChange({
											...assessmentSystem,
											cgpaConfig: {
												...assessmentSystem.cgpaConfig!,
												gradePoints: newGradePoints
											}
										});
									}}
								/>
								<Input
									type="number"
									placeholder="Min %"
									value={grade.minPercentage}
									onChange={(e) => {
										const newGradePoints = [...assessmentSystem.cgpaConfig!.gradePoints];
										newGradePoints[index] = { ...grade, minPercentage: Number(e.target.value) };
										onAssessmentSystemChange({
											...assessmentSystem,
											cgpaConfig: {
												...assessmentSystem.cgpaConfig!,
												gradePoints: newGradePoints
											}
										});
									}}
								/>
								<Input
									type="number"
									placeholder="Max %"
									value={grade.maxPercentage}
									onChange={(e) => {
										const newGradePoints = [...assessmentSystem.cgpaConfig!.gradePoints];
										newGradePoints[index] = { ...grade, maxPercentage: Number(e.target.value) };
										onAssessmentSystemChange({
											...assessmentSystem,
											cgpaConfig: {
												...assessmentSystem.cgpaConfig!,
												gradePoints: newGradePoints
											}
										});
									}}
								/>
							</div>
						))}
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="semesterWeightage"
							checked={assessmentSystem.cgpaConfig?.semesterWeightage}
							onCheckedChange={(checked) => {
								onAssessmentSystemChange({
									...assessmentSystem,
									cgpaConfig: {
										...assessmentSystem.cgpaConfig!,
										semesterWeightage: checked as boolean
									}
								});
							}}
						/>
						<Label htmlFor="semesterWeightage">Apply semester weightage</Label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="includeBacklogs"
							checked={assessmentSystem.cgpaConfig?.includeBacklogs}
							onCheckedChange={(checked) => {
								onAssessmentSystemChange({
									...assessmentSystem,
									cgpaConfig: {
										...assessmentSystem.cgpaConfig!,
										includeBacklogs: checked as boolean
									}
								});
							}}
						/>
						<Label htmlFor="includeBacklogs">Include backlogs in CGPA calculation</Label>
					</div>
				</div>
			)}
		</div>
	);
};




