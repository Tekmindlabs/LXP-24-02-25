'use client';

import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
	name: z.string().min(1, "Campus name is required"),
	code: z.string()
		.min(1, "Campus code is required")
		.regex(/^[A-Z0-9-]+$/, "Code must contain only uppercase letters, numbers, and hyphens"),
	establishmentDate: z.string()
		.min(1, "Establishment date is required")
		.refine((date) => new Date(date) <= new Date(), "Date cannot be in the future"),
	type: z.enum(["MAIN", "BRANCH"]),
	status: z.enum(["ACTIVE", "INACTIVE"]),
	streetAddress: z.string().min(1, "Street address is required"),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State/Province is required"),
	country: z.string().min(1, "Country is required"),
	postalCode: z.string()
		.min(1, "Postal code is required")
		.regex(/^[A-Z0-9-\s]+$/, "Invalid postal code format"),
	gpsCoordinates: z.string()
		.optional()
		.refine((val) => !val || /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(val), {
			message: "Invalid GPS coordinates format (e.g., 12.3456, -78.9012)",
		}),
	primaryPhone: z.string()
		.min(1, "Primary phone is required")
		.regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
	secondaryPhone: z.string()
		.optional()
		.refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
			message: "Invalid phone number format",
		}),
	email: z.string()
		.min(1, "Email is required")
		.email("Invalid email format"),
	emergencyContact: z.string()
		.min(1, "Emergency contact is required")
		.regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
});

interface CampusFormProps {
	isOpen: boolean;
	onClose: () => void;
	campusId?: string | null;
}

const CampusForm: FC<CampusFormProps> = ({ isOpen, onClose, campusId }) => {
	const utils = api.useContext();

	const form = useForm<z.infer<typeof formSchema>>({

		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			code: "",
			establishmentDate: "",
			type: "MAIN",
			status: "ACTIVE",
			streetAddress: "",
			city: "",
			state: "",
			country: "",
			postalCode: "",
			gpsCoordinates: "",
			primaryPhone: "",
			secondaryPhone: "",
			email: "",
			emergencyContact: "",
		},
	});

	const { data: campusData } = api.campus.getById.useQuery(
		campusId || "",
		{
			enabled: !!campusId,
			refetchOnWindowFocus: false,
			retry: false,
		}
	);


	useEffect(() => {
		if (campusData) {
			try {
				const establishmentDate = campusData.establishmentDate instanceof Date 
					? campusData.establishmentDate.toISOString().split('T')[0]
					: String(campusData.establishmentDate);

				form.reset({
					name: campusData.name,
					code: campusData.code,
					establishmentDate,
					type: campusData.type,
					status: campusData.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
					streetAddress: campusData.streetAddress,
					city: campusData.city,
					state: campusData.state,
					country: campusData.country,
					postalCode: campusData.postalCode,
					gpsCoordinates: campusData.gpsCoordinates || "",
					primaryPhone: campusData.primaryPhone,
					secondaryPhone: campusData.secondaryPhone || "",
					email: campusData.email,
					emergencyContact: campusData.emergencyContact,
				});
			} catch (error: unknown) {
				toast({
					title: "Error",
					description: "Failed to load campus data",
					variant: "destructive",
				});
			}
		}
	}, [campusData, form]);

	const updateCampus = api.campus.update.useMutation({
		onSuccess: () => {
			console.log('Campus update onSuccess triggered');
			toast({
				title: "Success",
				description: "Campus updated successfully",
			});
			void utils.campus.getAll.invalidate();
			onClose();
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const createCampus = api.campus.create.useMutation({
		onSuccess: () => {
			console.log('Campus create onSuccess triggered');
			toast({
				title: "Success",
				description: "Campus created successfully",
			});
			void utils.campus.getAll.invalidate();
			onClose();
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const onSubmit = (data: z.infer<typeof formSchema>) => {
		if (campusId) {
			updateCampus.mutate({ id: campusId, ...data });
		} else {
			createCampus.mutate(data);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{campusId ? 'Edit' : 'Create'} Campus</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Campus Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="code"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Campus Code</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="establishmentDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Establishment Date</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
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
										<FormLabel>Campus Type</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="MAIN">Main</SelectItem>
												<SelectItem value="BRANCH">Branch</SelectItem>
											</SelectContent>
										</Select>
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
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="ACTIVE">Active</SelectItem>
												<SelectItem value="INACTIVE">Inactive</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-medium">Location Information</h3>
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="streetAddress"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Street Address</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem>
											<FormLabel>City</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="state"
									render={({ field }) => (
										<FormItem>
											<FormLabel>State/Province</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="country"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Country</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="postalCode"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Postal Code</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="gpsCoordinates"
									render={({ field }) => (
										<FormItem>
											<FormLabel>GPS Coordinates (Optional)</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-medium">Contact Information</h3>
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="primaryPhone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Primary Phone</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="secondaryPhone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Secondary Phone (Optional)</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email Address</FormLabel>
											<FormControl>
												<Input type="email" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="emergencyContact"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Emergency Contact</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<div className="flex justify-end gap-2">
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button 
								type="submit" 
								disabled={createCampus.isPending || updateCampus.isPending}
							>
								{campusId ? "Update" : "Create"} Campus
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default CampusForm;