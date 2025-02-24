'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Status } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

import { api } from "@/utils/api";

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	classGroupId: z.string().min(1, "Class Group is required"),
	campusId: z.string().min(1, "Campus is required"),
	buildingId: z.string().optional(),
	roomId: z.string().optional(),
	capacity: z.number().min(1, "Capacity must be at least 1"),
	status: z.enum([Status.ACTIVE, Status.INACTIVE, Status.ARCHIVED]),
	classTutorId: z.string().optional(),
	teacherIds: z.array(z.string()).optional(),
	description: z.string().optional(),
	academicYear: z.string().optional(),
	semester: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ClassFormProps {
	isOpen: boolean;
	onClose: () => void;
	selectedClass?: {
		id: string;
		name: string;
		capacity: number;
		status: Status;
		classTutorId?: string;
		campusId?: string;
		buildingId?: string;
		roomId?: string;
		classGroup: {
			id: string;
			program: {
				assessmentSystem?: {
					name: string;
				};
				termStructures?: {
					name: string;
				}[];
			};
		};
		teachers: {
			teacher: {
				id: string;
			};
		}[];
		gradeBook?: {
			id: string;
		};
	};
	classGroups: { id: string; name: string }[];
	teachers: { id: string; user: { name: string } }[];
	campuses: {
		id: string;
		name: string;
		buildings?: {
			id: string;
			name: string;
			rooms?: {
				id: string;
				number: string;
				capacity: number;
			}[];
		}[];
	}[];
}

export const ClassForm = ({ isOpen, onClose, selectedClass, classGroups, teachers, campuses }: ClassFormProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedCampusId, setSelectedCampusId] = useState<string>(selectedClass?.campusId || "");
	const [selectedBuildingId, setSelectedBuildingId] = useState<string>(selectedClass?.buildingId || "");

	const buildings = selectedCampusId 
		? campuses.find(c => c.id === selectedCampusId)?.buildings || []
		: [];

	const rooms = selectedBuildingId
		? buildings.find(b => b.id === selectedBuildingId)?.rooms || []
		: [];
	const { toast } = useToast();
	const utils = api.useUtils();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: selectedClass?.name || "",
			classGroupId: selectedClass?.classGroup.id || "",
			campusId: selectedClass?.campusId || "",
			buildingId: selectedClass?.buildingId || "",
			roomId: selectedClass?.roomId || "",
			capacity: selectedClass?.capacity || 30,
			status: selectedClass?.status || Status.ACTIVE,
			teacherIds: selectedClass?.teachers.map(t => t.teacher.id) || [],
			classTutorId: selectedClass?.classTutorId || "NO_CLASS_TUTOR",
		},
	});

	const createClass = api.class.createClass.useMutation({
		onSuccess: () => {
			utils.class.searchClasses.invalidate();
			form.reset();
			onClose();
			toast({
				title: "Success",
				description: "Class created successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const updateClass = api.class.updateClass.useMutation({
		onSuccess: () => {
			utils.class.searchClasses.invalidate();
			onClose();
			toast({
				title: "Success",
				description: "Class updated successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const onSubmit = async (values: FormValues) => {
		setIsSubmitting(true);
		try {
			if (selectedClass) {
				await updateClass.mutateAsync({
					id: selectedClass.id,
					...values,
				});
			} else {
				await createClass.mutateAsync(values);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
		  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
			<DialogHeader>
			  <DialogTitle>{selectedClass ? "Edit" : "Create"} Class</DialogTitle>
			</DialogHeader>
			<Form {...form}>
			  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<Tabs defaultValue="basic" className="w-full">
				  <TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="basic">Basic Information</TabsTrigger>
					<TabsTrigger value="teachers">Teachers</TabsTrigger>
					<TabsTrigger value="additional">Additional Details</TabsTrigger>
					<TabsTrigger value="settings">Inherited Settings</TabsTrigger>
				  </TabsList>

				  <TabsContent value="basic" className="space-y-4">
				<FormField
				  control={form.control}
				  name="name"
				  render={({ field }) => (
					<FormItem>
					  <FormLabel>Class Name</FormLabel>
					  <FormControl>
						<Input {...field} />
					  </FormControl>
					  <FormMessage />
					</FormItem>
				  )}
				/>

				<div className="grid grid-cols-2 gap-4">
				  <FormField
					control={form.control}
					name="campusId"
					render={({ field }) => (
					  <FormItem>
						<FormLabel>Campus</FormLabel>
						<Select 
						  onValueChange={(value) => {
							field.onChange(value);
							setSelectedCampusId(value);
							form.setValue("buildingId", "");
							form.setValue("roomId", "");
						  }} 
						  value={field.value}
						>
						  <FormControl>
							<SelectTrigger>
							  <SelectValue placeholder="Select campus" />
							</SelectTrigger>
						  </FormControl>
						  <SelectContent>
							{campuses.map((campus) => (
							  <SelectItem key={campus.id} value={campus.id}>
								{campus.name}
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
					name="buildingId"
					render={({ field }) => (
					  <FormItem>
						<FormLabel>Building</FormLabel>
						<Select 
						  onValueChange={(value) => {
							field.onChange(value);
							setSelectedBuildingId(value);
							form.setValue("roomId", "");
						  }} 
						  value={field.value}
						  disabled={!selectedCampusId}
						>
						  <FormControl>
							<SelectTrigger>
							  <SelectValue placeholder="Select building" />
							</SelectTrigger>
						  </FormControl>
						  <SelectContent>
							{buildings.map((building) => (
							  <SelectItem key={building.id} value={building.id}>
								{building.name}
							  </SelectItem>
							))}
						  </SelectContent>
						</Select>
						<FormMessage />
					  </FormItem>
					)}
				  />
				</div>

				<div className="grid grid-cols-2 gap-4">
				  <FormField
					control={form.control}
					name="roomId"
					render={({ field }) => (
					  <FormItem>
						<FormLabel>Room</FormLabel>
						<Select 
						  onValueChange={field.onChange} 
						  value={field.value}
						  disabled={!selectedBuildingId}
						>
						  <FormControl>
							<SelectTrigger>
							  <SelectValue placeholder="Select room" />
							</SelectTrigger>
						  </FormControl>
						  <SelectContent>
							{rooms.map((room) => (
							  <SelectItem key={room.id} value={room.id}>
								{room.number} (Capacity: {room.capacity})
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
					name="classGroupId"
					render={({ field }) => (
					  <FormItem>
						<FormLabel>Class Group</FormLabel>
						<Select onValueChange={field.onChange} value={field.value}>
						  <FormControl>
							<SelectTrigger>
							  <SelectValue placeholder="Select a class group" />
							</SelectTrigger>
						  </FormControl>
						  <SelectContent>
							{classGroups.map((group) => (
							  <SelectItem key={group.id} value={group.id}>
								{group.name}
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
							onChange={e => field.onChange(parseInt(e.target.value))}
						  />
						</FormControl>
						<FormMessage />
					  </FormItem>
					)}
				  />
				</div>

				<FormField
				  control={form.control}
				  name="status"
				  render={({ field }) => (
					<FormItem>
					  <FormLabel>Status</FormLabel>
					  <Select onValueChange={field.onChange} value={field.value}>
						<FormControl>
						  <SelectTrigger>
							<SelectValue placeholder="Select status" />
						  </SelectTrigger>
						</FormControl>
						<SelectContent>
						  {Object.values(Status).map((status) => (
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
			  </TabsContent>

			  <TabsContent value="teachers" className="space-y-4">
				<FormField
				  control={form.control}
				  name="classTutorId"
				  render={({ field }) => (
					<FormItem>
					  <FormLabel>Class Tutor</FormLabel>
					  <Select onValueChange={field.onChange} value={field.value || "NO_CLASS_TUTOR"}>
						<FormControl>
						  <SelectTrigger>
							<SelectValue placeholder="Select class tutor" />
						  </SelectTrigger>
						</FormControl>
						<SelectContent>
						  <SelectItem value="NO_CLASS_TUTOR">None</SelectItem>
						  {teachers.map((teacher) => (
							<SelectItem key={teacher.id} value={teacher.id}>
							  {teacher.user.name}
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
				  name="teacherIds"
				  render={({ field }) => (
					<FormItem>
					  <FormLabel>Subject Teachers</FormLabel>
					  <ScrollArea className="h-[200px] border rounded-md p-4">
						<div className="space-y-2">
						  {teachers.map((teacher) => (
							<div key={teacher.id} className="flex items-center space-x-2">
							  <Checkbox
								checked={field.value?.includes(teacher.id)}
								onCheckedChange={(checked) => {
								  const currentValues = field.value || [];
								  const newValues = checked
									? [...currentValues, teacher.id]
									: currentValues.filter(id => id !== teacher.id);
								  field.onChange(newValues);
								}}
							  />
							  <label className="text-sm">{teacher.user.name}</label>
							</div>
						  ))}
						</div>
					  </ScrollArea>
					  <FormMessage />
					</FormItem>
				  )}
				/>
			  </TabsContent>

			  <TabsContent value="additional" className="space-y-4">
				<FormField
				  control={form.control}
				  name="description"
				  render={({ field }) => (
					<FormItem>
					  <FormLabel>Description</FormLabel>
					  <FormControl>
						<Input {...field} />
					  </FormControl>
					  <FormMessage />
					</FormItem>
				  )}
				/>

				<div className="grid grid-cols-2 gap-4">
				  <FormField
					control={form.control}
					name="academicYear"
					render={({ field }) => (
					  <FormItem>
						<FormLabel>Academic Year</FormLabel>
						<FormControl>
						  <Input {...field} />
						</FormControl>
						<FormMessage />
					  </FormItem>
					)}
				  />

				  <FormField
					control={form.control}
					name="semester"
					render={({ field }) => (
					  <FormItem>
						<FormLabel>Semester</FormLabel>
						<FormControl>
						  <Input {...field} />
						</FormControl>
						<FormMessage />
					  </FormItem>
					)}
				  />
				</div>
			  </TabsContent>

			  <TabsContent value="settings" className="space-y-4">
				<div className="space-y-4">
					<div className="grid gap-4 border rounded-lg p-4">
						<div>
							<h3 className="font-medium mb-2">Assessment System</h3>
							<p className="text-sm text-muted-foreground">
								{selectedClass?.classGroup?.program?.assessmentSystem?.name || 
								"Will inherit from class group"}
							</p>
						</div>
						<div>
							<h3 className="font-medium mb-2">Term Structure</h3>
							<p className="text-sm text-muted-foreground">
								{selectedClass?.classGroup?.program?.termStructures?.[0]?.name || 
								"Will inherit from class group"}
							</p>
						</div>
						<div>
							<h3 className="font-medium mb-2">Gradebook Status</h3>
							<p className="text-sm text-muted-foreground">
								{selectedClass?.gradeBook ? "Initialized" : "Will be initialized on creation"}
							</p>
						</div>
					</div>
				</div>
			  </TabsContent>
			</Tabs>

			<div className="flex justify-end space-x-2">
			  <Button variant="outline" type="button" onClick={onClose}>
				Cancel
			  </Button>
			  <Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? "Saving..." : selectedClass ? "Update" : "Create"}
			  </Button>
			</div>
		  </form>
		</Form>
	  </DialogContent>
	</Dialog>
	  );
};