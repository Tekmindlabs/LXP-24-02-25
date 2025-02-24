import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FloorForm } from "./FloorForm";
import { useToast } from "../../../hooks/use-toast";
import type { Floor } from "@prisma/client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus } from "lucide-react";

interface FloorManagementProps {
	buildingId: string;
}

type RowType = {
	original: Floor;
};

export const FloorManagement = ({ buildingId }: FloorManagementProps) => {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
	const { toast } = useToast();

	const { data: floors, refetch } = api.floor.getAll.useQuery({ buildingId });
	const deleteMutation = api.floor.delete.useMutation({
		onSuccess: () => {
			toast({
				title: "Floor deleted",
				description: "The floor has been deleted successfully",
			});
			refetch();
		},
	});

	const handleEdit = (floor: Floor) => {
		setSelectedFloor(floor);
		setIsFormOpen(true);
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteMutation.mutateAsync({ id });
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete floor",
				variant: "destructive",
			});
		}
	};

	const columns = [
		{
			accessorKey: "number",
			header: "Floor Number",
		},
		{
			id: "actions",
			cell: ({ row }: { row: RowType }) => {
				const floor = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger>
							<MoreHorizontal className="h-4 w-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onClick={() => handleEdit(floor)}>
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleDelete(floor.id)}>
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold">Floors</h2>
				<Button onClick={() => setIsFormOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Floor
				</Button>
			</div>

			<DataTable
				columns={columns}
				data={floors || []}
			/>

			<FloorForm
				isOpen={isFormOpen}
				onClose={() => {
					setIsFormOpen(false);
					setSelectedFloor(null);
				}}
				floor={selectedFloor}
				buildingId={buildingId}
				onSuccess={() => {
					setIsFormOpen(false);
					setSelectedFloor(null);
					refetch();
				}}
			/>
		</div>
	);
};
