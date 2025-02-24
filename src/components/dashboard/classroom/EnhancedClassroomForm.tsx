import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/utils/api";
import { useToast } from "../../../hooks/use-toast";
import type { Room } from "@prisma/client";
import { RoomType, RoomStatus } from "@prisma/client";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { roomSchema } from "@/server/api/validation/room";
import type { z } from "zod";

interface EnhancedClassroomFormProps {
	isOpen: boolean;
	onClose: () => void;
	room?: Room | null;
	onSuccess: () => void;
}

type FormValues = z.infer<typeof roomSchema>;

export const EnhancedClassroomForm = ({
	isOpen,
	onClose,
	room,
	onSuccess,
}: EnhancedClassroomFormProps) => {
	const [selectedCampus, setSelectedCampus] = useState<string>("");
	const [selectedBuilding, setSelectedBuilding] = useState<string>("");
	const [selectedFloor, setSelectedFloor] = useState<string>("");


	const { toast } = useToast();
	const form = useForm<FormValues>({
		resolver: zodResolver(roomSchema),
		defaultValues: room || {
			number: "",
			wingId: "",
			type: "CLASSROOM" as RoomType,
			capacity: 30,
			status: "ACTIVE" as RoomStatus,
			resources: {},
		},
	});

	const { data: campuses } = api.campus.getAll.useQuery();
	const { data: buildings } = api.building.getAll.useQuery(
		{ campusId: selectedCampus },
		{ enabled: !!selectedCampus }
	);
	const { data: floors } = api.floor.getAll.useQuery(
		{ buildingId: selectedBuilding },
		{ enabled: !!selectedBuilding }
	);
	const { data: wings } = api.wing.getAll.useQuery(
		{ floorId: selectedFloor },
		{ enabled: !!selectedFloor }
	);

	const createMutation = api.room.create.useMutation({
		onSuccess: () => {
			toast({
				title: "Room created",
				description: "The room has been created successfully",
			});
			onSuccess();
		},
	});

	const updateMutation = api.room.update.useMutation({
		onSuccess: () => {
			toast({
				title: "Room updated",
				description: "The room has been updated successfully",
			});
			onSuccess();
		},
	});

	useEffect(() => {
		if (room) {
			// Load the hierarchical data for editing
			// This would require additional API calls to get the full hierarchy
		}
	}, [room]);

	const onSubmit = async (values: FormValues) => {
		try {
			if (room) {
				await updateMutation.mutateAsync({
					id: room.id,
					data: values,
				});
			} else {
				await createMutation.mutateAsync(values);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to save room",
				variant: "destructive",
			});
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{room ? "Edit Room" : "Create Room"}
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="wingId"
							render={({ field }) => (
								<div className="space-y-4">
									<FormItem>
										<FormLabel>Campus</FormLabel>
										<Select
											value={selectedCampus}
											onValueChange={setSelectedCampus}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select Campus" />
											</SelectTrigger>
											<SelectContent>
												{campuses?.map((campus) => (
													<SelectItem key={campus.id} value={campus.id}>
														{campus.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>

									<FormItem>
										<FormLabel>Building</FormLabel>
										<Select
											value={selectedBuilding}
											onValueChange={setSelectedBuilding}
											disabled={!selectedCampus}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select Building" />
											</SelectTrigger>
											<SelectContent>
												{buildings?.map((building) => (
													<SelectItem key={building.id} value={building.id}>
														{building.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>

									<FormItem>
										<FormLabel>Floor</FormLabel>
										<Select
											value={selectedFloor}
											onValueChange={setSelectedFloor}
											disabled={!selectedBuilding}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select Floor" />
											</SelectTrigger>
											<SelectContent>
												{floors?.map((floor) => (
													<SelectItem key={floor.id} value={floor.id}>
														Floor {floor.number}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>

									<FormItem>
										<FormLabel>Wing</FormLabel>
										<Select
											value={field.value}
											onValueChange={field.onChange}
											disabled={!selectedFloor}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select Wing" />
											</SelectTrigger>
											<SelectContent>
												{wings?.map((wing) => (
													<SelectItem key={wing.id} value={wing.id}>
														{wing.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								</div>
							)}
						/>

						<FormField
							control={form.control}
							name="number"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Room Number</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Room Type</FormLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.values(RoomType).map((type) => (
												<SelectItem key={type} value={type}>
													{type.replace(/_/g, " ")}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="capacity"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Capacity</FormLabel>
									<FormControl>
										<Input
											type="number"
											{...field}
											onChange={(e) => field.onChange(parseInt(e.target.value))}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Status</FormLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.values(RoomStatus).map((status) => (
												<SelectItem key={status} value={status}>
													{status}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end space-x-2">
							<Button variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit">
								{room ? "Update" : "Create"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};