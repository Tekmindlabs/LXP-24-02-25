import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EnhancedClassroomForm } from "../classroom/EnhancedClassroomForm";
import { useToast } from "../../../hooks/use-toast";
import type { Room, RoomStatus } from "@prisma/client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RoomManagementProps {
	wingId: string;
}

type DataTableRow = {
	original: Room;
};

type Column = {
	accessorKey?: string;
	id?: string;
	header: string;
	cell?: ({ row }: { row: DataTableRow }) => React.ReactNode;
};


export const RoomManagement = ({ wingId }: RoomManagementProps) => {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
	const { toast } = useToast();

	const { data: rooms, refetch } = api.room.getAll.useQuery({ wingId });
	const deleteMutation = api.room.delete.useMutation({
		onSuccess: () => {
			toast({
				title: "Room deleted",
				description: "The room has been deleted successfully",
			});
			refetch();
		},
	});

	const handleEdit = (room: Room) => {
		setSelectedRoom(room);
		setIsFormOpen(true);
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteMutation.mutateAsync({ id });
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete room",
				variant: "destructive",
			});
		}
	};

	const columns: Column[] = [
		{
			accessorKey: "number",
			header: "Room Number",
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => {
				const type = row.original.type;
				return type.replace(/_/g, " ");
			},
		},
		{
			accessorKey: "capacity",
			header: "Capacity",
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.original.status;
				return (
					<Badge variant={status === "ACTIVE" ? "success" : "destructive"}>
						{status}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const room = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger>
							<MoreHorizontal className="h-4 w-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onClick={() => handleEdit(room)}>
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleDelete(room.id)}>
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
				<h2 className="text-xl font-semibold">Rooms</h2>
				<Button onClick={() => setIsFormOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Room
				</Button>
			</div>

			<DataTable
				columns={columns}
				data={rooms || []}
			/>

			<EnhancedClassroomForm
				isOpen={isFormOpen}
				onClose={() => {
					setIsFormOpen(false);
					setSelectedRoom(null);
				}}
				room={selectedRoom}
				onSuccess={() => {
					setIsFormOpen(false);
					setSelectedRoom(null);
					refetch();
				}}
			/>
		</div>
	);
};