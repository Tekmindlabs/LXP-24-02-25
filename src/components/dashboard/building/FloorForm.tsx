import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/utils/api";
import { useToast } from "../../../hooks/use-toast";
import type { Floor } from "@prisma/client";
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
import { floorSchema } from "@/server/api/validation/floor";
import type { z } from "zod";

interface FloorFormProps {
	isOpen: boolean;
	onClose: () => void;
	floor?: Floor | null;
	buildingId: string;
	onSuccess: () => void;
}

type FormValues = z.infer<typeof floorSchema>;

export const FloorForm = ({
	isOpen,
	onClose,
	floor,
	buildingId,
	onSuccess,
}: FloorFormProps) => {
	const { toast } = useToast();
	const form = useForm<FormValues>({
		resolver: zodResolver(floorSchema),
		defaultValues: floor || {
			number: 0,
			buildingId,
		},
	});

	const createMutation = api.floor.create.useMutation({
		onSuccess: () => {
			toast({
				title: "Floor created",
				description: "The floor has been created successfully",
			});
			onSuccess();
		},
	});

	const updateMutation = api.floor.update.useMutation({
		onSuccess: () => {
			toast({
				title: "Floor updated",
				description: "The floor has been updated successfully",
			});
			onSuccess();
		},
	});

	const onSubmit = async (values: FormValues) => {
		try {
			if (floor) {
				await updateMutation.mutateAsync({
					id: floor.id,
					data: values,
				});
			} else {
				await createMutation.mutateAsync(values);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to save floor",
				variant: "destructive",
			});
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{floor ? "Edit Floor" : "Create Floor"}
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="number"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Floor Number</FormLabel>
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
						<input type="hidden" {...form.register("buildingId")} value={buildingId} />
						<div className="flex justify-end space-x-2">
							<Button variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit">
								{floor ? "Update" : "Create"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};