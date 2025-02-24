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

export default function TeachersPage() {
	return (
		<div className="space-y-6">
			<CampusTabs />
			
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-bold tracking-tight">Campus Teachers</h2>
				<Button>
					<Plus className="mr-2 h-4 w-4" /> Assign Teacher
				</Button>
			</div>

			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Subjects</TableHead>
							<TableHead>Classes</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{/* Teacher data will be mapped here */}
					</TableBody>
				</Table>
			</Card>
		</div>
	);
}