import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { BuildingForm } from "@/components/dashboard/building/BuildingForm";
import { useToast } from "../../../hooks/use-toast";
import type { Building } from "@prisma/client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus } from "lucide-react";

type RowType = {
	original: Building;
};

export const BuildingManagement = () => {

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
	const { toast } = useToast();

	const { data: buildings, refetch } = api.building.getAll.useQuery({});
	const deleteMutation = api.building.delete.useMutation({
		onSuccess: () => {
			toast({
				title: "Building deleted",
				description: "The building has been deleted successfully",
			});
			refetch();
		},
	});

	const handleEdit = (building: Building) => {
		setSelectedBuilding(building);
		setIsFormOpen(true);
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteMutation.mutateAsync({ id });
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete building",
				variant: "destructive",
			});
		}
	};

	const columns = [
		{
			accessorKey: "name",
			header: "Name",
		},
		{
			accessorKey: "code",
			header: "Code",
		},
		{
			id: "actions",
			cell: ({ row }: { row: RowType }) => {
				const building = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger>
							<MoreHorizontal className="h-4 w-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onClick={() => handleEdit(building)}>
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleDelete(building.id)}>
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	return (
		<div className="container mx-auto py-6">
		  <div className="flex justify-between items-center mb-6">
			<h1 className="text-2xl font-bold">Buildings</h1>
			<Button onClick={() => setIsFormOpen(true)}>
			  <Plus className="mr-2 h-4 w-4" />
			  Add Building
			</Button>
		  </div>

		  <DataTable columns={columns} data={buildings || []} />

		  <BuildingForm
			isOpen={isFormOpen}
			onClose={() => {
			  setIsFormOpen(false);
			  setSelectedBuilding(null);
			}}
			building={selectedBuilding}
			onSuccess={() => {
			  setIsFormOpen(false);
			  setSelectedBuilding(null);
			  refetch();
			}}
		  />
		</div>
	  );
	};
