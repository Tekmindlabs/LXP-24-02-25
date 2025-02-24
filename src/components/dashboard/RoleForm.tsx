import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/utils/api";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PermissionQueryResult {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  campusId: string | null;
}

export const roleFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  context: z.enum(["core", "campus"]),
  permissions: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface Permission {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  campusId: string | null;
}

interface RoleFormProps {
  initialData?: {
    name: string;
    description: string;
    context: "core" | "campus";
    permissions: string[];
  };
  onSubmit: (data: RoleFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RoleForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: RoleFormProps) {
  const { data: rolesData } = api.role.getAll.useQuery();
  
  // Extract unique permissions from roles
  const permissions = rolesData?.flatMap(role => 
    role.permissions.map(rp => rp.permission)
  ).filter((permission, index, self) => 
    index === self.findIndex((p) => p.id === permission.id)
  ) ?? [];

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      context: "core",
      permissions: [],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="permissions"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Permissions</FormLabel>
                <FormDescription>
                  Select the permissions for this role
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {permissions.map((permission: Permission) => (
                  <FormField
                    key={permission.id}
                    control={form.control}
                    name="permissions"
                    render={({ field }) => (
                      <FormItem
                        key={permission.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(permission.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, permission.id])
                                : field.onChange(
                                    field.value?.filter((value) => value !== permission.id)
                                  );
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal">{permission.name}</FormLabel>
                          {permission.description && (
                            <FormDescription>{permission.description}</FormDescription>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter role name" {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed for this role.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter role description"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Provide a detailed description of this role's responsibilities.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="context"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="core" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Core Role
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="campus" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Campus Role
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Select whether this is a core system role or campus-specific role.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Role"}
          </Button>
        </div>
      </form>
    </Form>
  );
}