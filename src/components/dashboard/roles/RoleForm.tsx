import { useState } from 'react';
import { api } from "@/utils/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface RoleFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    id: string;
    name: string;
    type: 'core' | 'campus';
    description: string;
    permissions: string[];
    campusId?: string;
  };
  onSuccess?: () => void;
}

export const RoleForm = ({ mode, initialData, onSuccess }: RoleFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'core',
    description: initialData?.description || '',
    campusId: initialData?.campusId || '',
    permissions: {} as Record<string, string[]>,
    resourceType: 'role'
  });

  const { toast } = useToast();
  const utils = api.useContext();

  const createRole = api.campusRolePermission.saveCampusRolePermissions.useMutation({
    onSuccess: () => {
      utils.campusRolePermission.getAllRoles.invalidate();
      toast({ title: "Success", description: "Role created successfully" });
      setIsOpen(false);
      onSuccess?.();
    },
  });

  const updateRole = api.campusRolePermission.saveCampusRolePermissions.useMutation({
    onSuccess: () => {
      utils.campusRolePermission.getAllRoles.invalidate();
      toast({ title: "Success", description: "Role updated successfully" });
      setIsOpen(false);
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      campusId: formData.type === 'campus' ? formData.campusId : '',
    };
    
    if (mode === 'create') {
      createRole.mutate(submitData);
    } else if (initialData?.id) {
      updateRole.mutate(submitData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === 'create' ? 'default' : 'outline'}>
          {mode === 'create' ? 'Create Role' : 'Edit'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Role' : 'Edit Role'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as 'core' | 'campus' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="campus">Campus</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">
            {mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};