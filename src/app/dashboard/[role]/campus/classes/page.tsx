import { CampusTabs } from "@/components/dashboard/campus/CampusTabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export default function ClassesPage() {
	return (
		<div className="space-y-6">
			<CampusTabs />
			
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-bold tracking-tight">Campus Classes</h2>
				<Button>
					<Plus className="mr-2 h-4 w-4" /> Add Class
				</Button>
			</div>

			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Class Name</TableHead>
							<TableHead>Grade Level</TableHead>
							<TableHead>Students</TableHead>
							<TableHead>Teachers</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{/* Class data will be mapped here */}
					</TableBody>
				</Table>
			</Card>
		</div>
	);
}