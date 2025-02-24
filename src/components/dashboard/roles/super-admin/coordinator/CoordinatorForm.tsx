'use client';

import { Status } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { api } from "@/utils/api";
import { toast } from "@/hooks/use-toast";

interface Program {
  id: string;
  name: string;
  level: string;
  campuses?: { id: string; name: string }[];
}

interface Campus {
  id: string;
  name: string;
}

const createFormSchema = (programs: Program[], campuses: Campus[]) => z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  type: z.enum(['PROGRAM_COORDINATOR', 'CAMPUS_PROGRAM_COORDINATOR'], {
    required_error: "Please select a coordinator type",
    invalid_type_error: "Please select a valid coordinator type"
  }),
  programIds: z.array(z.string())
    .min(1, "At least one program must be selected")
    .superRefine((programIds, ctx) => {
      const type = (ctx as any)._parent?.data?.type;
      const campusId = (ctx as any)._parent?.data?.campusId;
      
      if (type === 'CAMPUS_PROGRAM_COORDINATOR' && campusId) {
        const invalidPrograms = programIds.filter(id => {
          const program = programs.find(p => p.id === id);
          return !program?.campuses?.some(c => c.id === campusId);
        });
        
        if (invalidPrograms.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "All selected programs must belong to the selected campus"
          });
          return false;
        }
      }
      return true;
    }),
  campusId: z.string()
    .optional()
    .superRefine((val, ctx) => {
      const type = (ctx as any)._parent?.data?.type;
      if (type === 'CAMPUS_PROGRAM_COORDINATOR') {
        if (!val) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Campus selection is required for Campus Program Coordinator"
          });
          return false;
        }
        
        const campusExists = campuses.some(c => c.id === val);
        if (!campusExists) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Selected campus is invalid"
          });
          return false;
        }
      }
      return true;
    }),
  responsibilities: z.array(z.string())
    .min(1, "At least one responsibility is required"),
  status: z.nativeEnum(Status, {
    required_error: "Status is required"
  })
});

interface CoordinatorFormProps {
  selectedCoordinator?: {
    id: string;
    name: string;
    email: string;
    status: Status;
    type: 'PROGRAM_COORDINATOR' | 'CAMPUS_PROGRAM_COORDINATOR';
    coordinatorProfile: {
      programs: { id: string }[];
      campus?: { id: string; name: string };
      responsibilities: string[];
    };
  };
  programs: Program[];
  campuses: Campus[];
  onSuccess: () => void;
}

export const CoordinatorForm = ({ selectedCoordinator, programs, campuses, onSuccess }: CoordinatorFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredPrograms, setFilteredPrograms] = useState(programs);
  
  const utils = api.useContext();
  const formSchema = createFormSchema(programs, campuses);
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: selectedCoordinator?.name || "",
      email: selectedCoordinator?.email || "",
      type: selectedCoordinator?.type || undefined,
      programIds: selectedCoordinator?.coordinatorProfile.programs.map(p => p.id) || [],
      campusId: selectedCoordinator?.coordinatorProfile.campus?.id || undefined,
      responsibilities: selectedCoordinator?.coordinatorProfile.responsibilities || [],
      status: selectedCoordinator?.status || Status.ACTIVE,
    },
  });

  useEffect(() => {
    if (form.watch('type') === 'CAMPUS_PROGRAM_COORDINATOR' && form.watch('campusId')) {
      const campusId = form.watch('campusId');
      const filtered = programs.filter(program =>
        program.campuses?.some(campus => campus.id === campusId)
      );
      setFilteredPrograms(filtered);
    } else {
      setFilteredPrograms(programs);
    }
  }, [form.watch('campusId'), form.watch('type'), programs]);

  const defaultResponsibilities = [
    { value: "managing_terms", label: "Managing Terms" },
    { value: "coordinating_teachers", label: "Coordinating Teachers" },
    { value: "program_planning", label: "Program Planning" },
    { value: "assessment_management", label: "Assessment Management" },
    { value: "student_support", label: "Student Support" }
  ];


  // Clear campus and programs when type changes
  useEffect(() => {
    if (form.watch('type') === 'PROGRAM_COORDINATOR') {
      form.setValue('campusId', undefined);
      form.setValue('programIds', []);
    }
  }, [form.watch('type')]);


  const createCoordinator = api.coordinator.createCoordinator.useMutation({
    onSuccess: () => {
      utils.coordinator.searchCoordinators.invalidate();
      form.reset();
      onSuccess();
      toast({
        title: "Success",
        description: "Coordinator created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateCoordinator = api.coordinator.updateCoordinator.useMutation({
    onSuccess: () => {
      utils.coordinator.searchCoordinators.invalidate();
      onSuccess();
      toast({
        title: "Success",
        description: "Coordinator updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
  
      if (!values.type) {
        toast({
          title: "Error",
          description: "Please select a coordinator type",
          variant: "destructive"
        });
        return;
      }
  
      const coordinatorData = {
        name: values.name,
        email: values.email,
        type: values.type,
        programIds: values.programIds,
        campusId: values.type === 'CAMPUS_PROGRAM_COORDINATOR' ? values.campusId : undefined,
        responsibilities: values.responsibilities,
        status: values.status
      };
  
      console.log('Submitting coordinator data:', coordinatorData); // Add logging
  
      if (selectedCoordinator) {
        await updateCoordinator.mutateAsync({
          id: selectedCoordinator.id,
          ...coordinatorData
        });
      } else {
        await createCoordinator.mutateAsync(coordinatorData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save coordinator",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Coordinator Type Field */}
<FormField
  control={form.control}
  name="type"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Coordinator Type</FormLabel>
      <Select 
        onValueChange={field.onChange} 
        value={field.value}
        required
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select coordinator type" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="PROGRAM_COORDINATOR">Program Coordinator</SelectItem>
          <SelectItem value="CAMPUS_PROGRAM_COORDINATOR">Campus Program Coordinator</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>

        {/* Campus Selection (Conditional) */}
        {form.watch('type') === 'CAMPUS_PROGRAM_COORDINATOR' && (
          <FormField
            control={form.control}
            name="campusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campus</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campus" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {campuses.map(campus => (
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
        )}

        {/* Programs Field */}
        <FormField
          control={form.control}
          name="programIds"
          render={({ field }) => (
          <FormItem>
            <FormLabel>
            {form.watch('type') === 'CAMPUS_PROGRAM_COORDINATOR' ? 'Campus Programs' : 'Programs'}
            </FormLabel>
            <FormControl>
            <MultiSelect
                value={field.value}
                onChange={field.onChange}
                options={filteredPrograms.map(program => ({
                label: `${program.name} (${program.level})`,
                value: program.id
                }))}
                placeholder={`Select ${form.watch('type') === 'CAMPUS_PROGRAM_COORDINATOR' ? 'campus programs' : 'programs'}`}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          )}
        />

        {/* Responsibilities Field */}

<FormField
  control={form.control}
  name="responsibilities"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Responsibilities</FormLabel>
      <FormControl>
        <MultiSelect
          options={defaultResponsibilities}
          value={field.value}
          onChange={field.onChange}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

        {/* Status Field */}
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

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Saving...' : selectedCoordinator ? 'Update Coordinator' : 'Create Coordinator'}
        </Button>
      </form>
    </Form>
  );
};
