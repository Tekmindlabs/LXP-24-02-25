"use client";
import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type Campus = {
  id: string;
  name: string;
};

type Permission = {
  id: string;
  name: string;
  category: string;
  description: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
};

interface DynamicPermissionMatrixProps {
  permissions: Permission[];
  roles: Role[];
  campuses: Campus[];
  resourceType: string;
  templates: Array<{
    name: string;
    description: string;
    permissions: string[];
  }>;
  onTemplateSelect: (templateName: string) => void;
  initialPermissions: Record<string, Set<string>>;
}

export const DynamicPermissionMatrix = ({
  permissions,
  roles,
  campuses,
  resourceType,
  templates,
  onTemplateSelect,
  initialPermissions,
}: DynamicPermissionMatrixProps) => {
  const { toast } = useToast();
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, Set<string>>>(initialPermissions || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedCampus, setSelectedCampus] = useState<string>();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const handleTemplateSelect = (templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    if (!template) return;
    
    const newPermissions = Object.fromEntries(
      roles.map(role => [role.id, new Set(template.permissions)])
    );
    setSelectedPermissions(newPermissions);
    onTemplateSelect(templateName);
  };

  const handlePermissionChange = (roleId: string, permissionId: string) => {
    setSelectedPermissions(prev => {
      const rolePermissions = new Set(prev[roleId] || []);
      if (rolePermissions.has(permissionId)) {
        rolePermissions.delete(permissionId);
      } else {
        rolePermissions.add(permissionId);
      }
      return { ...prev, [roleId]: rolePermissions };
    });
  };

  const saveAssignments = async () => {
    if (!selectedCampus) {
      toast({
        title: 'Error',
        description: 'Please select a campus',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/trpc/campusRolePermission.saveCampusRolePermissions', { // Updated API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campusId: selectedCampus, // Include campusId in the request body
          resourceType,
          permissions: Object.entries(selectedPermissions).reduce((acc, [roleId, perms]) => ({
            ...acc,
            [roleId]: Array.from(perms)
          }), {}),
        }),
      });

      if (!response.ok) throw new Error('Failed to save permissions');

      toast({
        title: 'Permissions updated',
        description: 'Permission assignments saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save permission assignments',
        variant: 'destructive',
      });
    }
  };

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (roleFilter ? permission.category === roleFilter : true)
  );

  const categories = Array.from(new Set(permissions.map(p => p.category)));

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Select onValueChange={setSelectedCampus}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select campus" />
          </SelectTrigger>
          <SelectContent>
            {campuses.map((campus) => (
              <SelectItem key={campus.id} value={campus.id}>
                {campus.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => onTemplateSelect(value)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template: {name: string; description: string; permissions: string[]}) => (
              <SelectItem key={template.name} value={template.name}>
                {template.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Accordion type="multiple" value={Array.from(expandedCategories)}>
        {categories.map((category) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger>{category}</AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    {roles.map((role) => (
                      <TableHead key={role.id} className="text-center">
                        {role.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions
                    .filter(p => p.category === category)
                    .map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">
                          {permission.name}
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} className="text-center">
                            <Checkbox
                              checked={selectedPermissions[role.id]?.has(permission.id) || false}
                              onCheckedChange={() => handlePermissionChange(role.id, permission.id)}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="flex justify-end">
        <Button onClick={saveAssignments}>Save Assignments</Button>
      </div>
    </div>
  );
};
