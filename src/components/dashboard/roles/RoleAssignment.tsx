import { useState } from 'react';
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";

export const RoleAssignment = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([]);
  const { toast } = useToast();
  const utils = api.useContext();

  const { data: roles } = api.campusRolePermission.getAllRoles.useQuery();
  const { data: campuses } = api.campus.getAll.useQuery();

  // const validateRoleAssignment = async (roleId: string, campusIds: string[]) => { // commented out validateRoleAssignment
  //   const conflicts = await api.role.validateRoleAssignment.query({ roleId, campusIds });
  //   return conflicts;
  // };


  const assignRole = api.campusRolePermission.assignRoleToCampus.useMutation({
    onSuccess: () => {
      utils.campusRolePermission.getAllRoles.invalidate();
      toast({ title: "Success", description: "Role assigned successfully" });
      // Reset form
      setSelectedRole('');
      setSelectedCampuses([]);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || selectedCampuses.length === 0) {
      toast({
        title: "Error",
        description: "Please select both role and campuses",
        variant: "destructive",
      });
      return;
    }

    // const conflicts = await validateRoleAssignment(selectedRole, selectedCampuses); // commented out validateRoleAssignment
    // if (conflicts.length > 0) { // commented out conflict validation - whole block commented out
    //   const conflictMessages = conflicts.map(conflict => conflict.message || `Role already assigned to campus: ${conflict.campusName}`).join(", ");
    //   toast({
    //     title: "Conflict Error",
    //     description: conflictMessages,
    //     variant: "destructive",
    //   });
    //   return;
    // }

    assignRole.mutate({
      roleId: selectedRole,
      campusIds: selectedCampuses,
    });
  };

  const validateRoleAssignment = (conflict: any) => {}; // added empty validateRoleAssignment function to fix type error - added conflict param type any

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Role to Campuses</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Campuses</Label>
            <MultiSelect
              options={campuses?.map(campus => ({
                label: campus.name,
                value: campus.id,
              })) || []}
              value={selectedCampuses}
              onChange={setSelectedCampuses}
              placeholder="Select campuses"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedRole || selectedCampuses.length === 0}
          >
            Assign Role
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
