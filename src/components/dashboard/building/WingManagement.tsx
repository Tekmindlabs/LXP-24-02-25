import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { WingForm } from "@/components/dashboard/building/WingForm";
import { useToast } from "@/hooks/use-toast";
import type { Wing } from "@prisma/client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus } from "lucide-react";

interface WingManagementProps {
	floorId: string;
}

type RowType = {
	original: Wing;
};

export const WingManagement = ({ floorId }: WingManagementProps) => {

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedWing, setSelectedWing] = useState<Wing | null>(null);
	const { toast } = useToast();

	const { data: wings, refetch } = api.wing.getAll.useQuery({ floorId });

	const columns = [
		{
			accessorKey: "name",
			header: "Wing Name",
		},
		{
			id: "actions",
			cell: ({ row }: { row: RowType }) => {
				const wing = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger>
							<MoreHorizontal className="h-4 w-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onClick={() => handleEdit(wing)}>
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleDelete(wing.id)}>
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];
	const deleteMutation = api.wing.delete.useMutation({
		onSuccess: () => {
			toast({
				title: "Wing deleted",
				description: "The wing has been deleted successfully",
			});
			refetch();
		},
	});

	const handleEdit = (wing: Wing) => {
		setSelectedWing(wing);
		setIsFormOpen(true);
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteMutation.mutateAsync({ id });
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete wing",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold">Wings</h2>
				<Button onClick={() => setIsFormOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Wing
				</Button>
			</div>

			<DataTable
				columns={columns}
				data={wings || []}
			/>

			<WingForm
				isOpen={isFormOpen}
				onClose={() => {
					setIsFormOpen(false);
					setSelectedWing(null);
				}}
				wing={selectedWing}
				floorId={floorId}
				onSuccess={() => {
					setIsFormOpen(false);
					setSelectedWing(null);
					refetch();
				}}
			/>
		</div>
	);
};