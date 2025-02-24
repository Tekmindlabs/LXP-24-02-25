import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/utils/api";
import { useToast } from "../../../hooks/use-toast";
import type { Wing } from "@prisma/client";
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
import { wingSchema } from "@/server/api/validation/wing";
import type { z } from "zod";

interface WingFormProps {
	isOpen: boolean;
	onClose: () => void;
	wing?: Wing | null;
	floorId: string;
	onSuccess: () => void;
}

type FormValues = z.infer<typeof wingSchema>;

export const WingForm = ({
	isOpen,
	onClose,
	wing,
	floorId,
	onSuccess,
}: WingFormProps) => {
	const { toast } = useToast();
	const form = useForm<FormValues>({
		resolver: zodResolver(wingSchema),
		defaultValues: wing || {
			name: "",
			floorId,
		},
	});

	const createMutation = api.wing.create.useMutation({
		onSuccess: () => {
			toast({
				title: "Wing created",
				description: "The wing has been created successfully",
			});
			onSuccess();
		},
	});

	const updateMutation = api.wing.update.useMutation({
		onSuccess: () => {
			toast({
				title: "Wing updated",
				description: "The wing has been updated successfully",
			});
			onSuccess();
		},
	});

	const onSubmit = async (values: FormValues) => {
		try {
			if (wing) {
				await updateMutation.mutateAsync({
					id: wing.id,
					data: values,
				});
			} else {
				await createMutation.mutateAsync(values);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to save wing",
				variant: "destructive",
			});
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{wing ? "Edit Wing" : "Create Wing"}
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Wing Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<input type="hidden" {...form.register("floorId")} value={floorId} />
						<div className="flex justify-end space-x-2">
							<Button variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit">
								{wing ? "Update" : "Create"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
