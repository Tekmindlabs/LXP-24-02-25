I'll provide detailed instructions for completing each partially implemented task, considering the existing codebase:

### Task 1: Unified Role Management Component
Current Status: Partially Implemented
Location: `src/components/dashboard/UnifiedRoleManagement.tsx`

```typescript
// Complete implementation for UnifiedRoleManagement.tsx
import { useState } from 'react';
import { api } from "@/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Role {
  id: string;
  name: string;
  type: 'core' | 'campus';
  description: string;
  permissions: string[];
}

export const UnifiedRoleManagement = () => {
  const [selectedType, setSelectedType] = useState<'core' | 'campus' | 'all'>('all');
  const { toast } = useToast();
  const utils = api.useContext();

  const { data: roles } = api.role.getAllRoles.useQuery();
  const createRole = api.role.createRole.useMutation({
    onSuccess: () => {
      utils.role.getAllRoles.invalidate();
      toast({ title: "Success", description: "Role created successfully" });
    }
  });

  const deleteRole = api.role.deleteRole.useMutation({
    onSuccess: () => {
      utils.role.getAllRoles.invalidate();
      toast({ title: "Success", description: "Role deleted successfully" });
    }
  });

  const filteredRoles = roles?.filter(role => 
    selectedType === 'all' ? true : role.type === selectedType
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as typeof selectedType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="core">Core Roles</SelectItem>
            <SelectItem value="campus">Campus Roles</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => {/* Open create role modal */}}>
          Create New Role
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRoles?.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.name}</TableCell>
              <TableCell>{role.type}</TableCell>
              <TableCell>{role.description}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => {/* Edit role */}}>
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => deleteRole.mutate(role.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

### Task 4: Campus Permission Scope
Current Status: Partially Implemented

1. Update Prisma Schema:
```prisma
// prisma/schema.prisma

model Permission {
  id          String   @id @default(cuid())
  name        String
  description String?
  campusId    String?  // Add campusId for campus-scoped permissions
  campus      Campus?  @relation(fields: [campusId], references: [id])
  roles       RolePermission[]
}

model RolePermission {
  id           String     @id @default(cuid())
  roleId       String
  permissionId String
  campusId     String?    // Add campusId for campus-specific assignments
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  campus       Campus?    @relation(fields: [campusId], references: [id])
}
```

2. Update Backend Logic:
```typescript
// src/server/api/routers/permission.ts

export const permissionRouter = createTRPCRouter({
  getPermissionsByCampus: protectedProcedure
    .input(z.object({ campusId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.permission.findMany({
        where: {
          OR: [
            { campusId: input.campusId },
            { campusId: null } // Include global permissions
          ]
        }
      });
    }),
});
```

### Task 5: Multi-Campus Role Assignment
Current Status: Partially Implemented

1. Update Role Assignment Component:
```typescript
// src/components/dashboard/roles/RoleAssignment.tsx

export const RoleAssignment = () => {
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([]);
  const { data: campuses } = api.campus.getAll.useQuery();
  
  const assignRole = api.role.assignRoleToCampus.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Role assigned successfully" });
    }
  });

  return (
    <div>
      <MultiSelect
        options={campuses?.map(campus => ({
          label: campus.name,
          value: campus.id
        }))}
        value={selectedCampuses}
        onChange={setSelectedCampuses}
      />
      {/* Role assignment form */}
    </div>
  );
};
```

### Task 6: Permission Inheritance
Current Status: Partially Implemented

1. Update Role Model:
```typescript
// src/types/role.ts

interface Role {
  id: string;
  name: string;
  parentId?: string;
  inheritedPermissions?: Permission[];
}

// src/server/api/routers/role.ts
const resolveInheritedPermissions = async (
  roleId: string,
  ctx: Context
): Promise<Permission[]> => {
  const role = await ctx.prisma.role.findUnique({
    where: { id: roleId },
    include: { parent: true }
  });

  if (!role?.parentId) return [];

  const parentPermissions = await ctx.prisma.permission.findMany({
    where: { roles: { some: { roleId: role.parentId } } }
  });

  const inheritedPermissions = await resolveInheritedPermissions(role.parentId, ctx);

  return [...parentPermissions, ...inheritedPermissions];
};
```

### Task 9: Documentation Updates
Current Status: Partially Implemented

1. Create Documentation Structure:
```markdown
# RBAC Documentation

## Architecture
- Core Components
- Permission Structure
- Role Hierarchy
- Campus Integration

## Implementation Details
- Database Schema
- API Endpoints
- Component Documentation
- Security Considerations

## Usage Examples
- Creating Roles
- Assigning Permissions
- Managing Campus Scope
- Role Inheritance

## Best Practices
- Role Design
- Permission Management
- Security Guidelines
- Performance Considerations
```

2. Implementation Steps:
- Create detailed documentation for each component
- Document API endpoints and their usage
- Provide code examples for common operations
- Include security best practices
- Add troubleshooting guide

3. Location: `/docs/rbac/`
- `architecture.md`
- `implementation.md`
- `api-reference.md`
- `usage-guide.md`
- `best-practices.md`

To complete these tasks:

1. Start with Task 1 (UnifiedRoleManagement) as it's the foundation
2. Implement Task 4 (Campus Permission Scope) database changes
3. Build Task 5 (Multi-Campus Role Assignment) on top of Tasks 1 and 4
4. Implement Task 6 (Permission Inheritance) logic
5. Finally, complete Task 9 (Documentation) to document all implementations

Testing Strategy:
```typescript
// src/tests/rbac/
describe('RBAC System', () => {
  test('role management', async () => {
    // Test role CRUD operations
  });

  test('campus permission scope', async () => {
    // Test campus-scoped permissions
  });

  test('multi-campus role assignment', async () => {
    // Test role assignments across campuses
  });

  test('permission inheritance', async () => {
    // Test role hierarchy and inheritance
  });
});
```

This implementation maintains compatibility with existing components while adding the required functionality for a complete RBAC system.