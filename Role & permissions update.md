Based on the provided codebase and requirements, I'll analyze the role-based access control (RBAC) implementation:

Strengths of Current Implementation:

1. Well-Structured Permission System:
```typescript
// Comprehensive permission definitions
const Permissions = {
  // User Management
  USER_CREATE: 'user.create',
  USER_READ: 'user.read',
  
  // Role Management  
  ROLE_CREATE: 'role.create',
  ROLE_READ: 'role.read',
  
  // Academic Management
  ACADEMIC_CALENDAR_VIEW: 'academic.calendar.view',
  ACADEMIC_CALENDAR_MANAGE: 'academic.calendar.manage',
  
  // Program Management
  PROGRAM_VIEW: 'program.view',
  PROGRAM_MANAGE: 'program.manage'
  // ...etc
} as const;
```

2. Clear Role Hierarchy:
```typescript
const ROLE_HIERARCHY = {
  CAMPUS_ADMIN: ['CAMPUS_MANAGER', 'CAMPUS_TEACHER', 'CAMPUS_STUDENT'],
  CAMPUS_MANAGER: ['CAMPUS_TEACHER', 'CAMPUS_STUDENT'],
  CAMPUS_COORDINATOR: ['CAMPUS_TEACHER', 'CAMPUS_STUDENT'],
  CAMPUS_TEACHER: ['CAMPUS_STUDENT'],
  CAMPUS_STUDENT: []
};
```

3. Role-Permission Mapping:
```typescript
const RolePermissions = {
  ADMIN: [/* all permissions */],
  COORDINATOR: [
    Permissions.PROGRAM_VIEW,
    Permissions.PROGRAM_MANAGE,
    Permissions.CLASS_GROUP_MANAGE
  ],
  TEACHER: [
    Permissions.CLASS_VIEW,
    Permissions.GRADEBOOK_MANAGE
  ]
  // ...etc
};
```

4. Protected Routes & Middleware:
```typescript
export function requireCampusPermission(permission: CampusPermission) {
  return async ({ ctx }: { ctx: Context }) => {
    const { userId, campusId } = ctx;
    if (!userId || !campusId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    
    const userService = new CampusUserService(ctx.prisma);
    const hasPermission = await withCampusPermission(
      userService,
      userId,
      campusId,
      permission
    );
    
    if (!hasPermission) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    
    return true;
  };
}
```

5. Role-Based Component Architecture:
```typescript
// Role-specific portals
/src/components/dashboard/roles/
  ├── super-admin/
  ├── coordinator/
  ├── teacher/
  ├── student/
  └── parent/
```

Areas for Enhancement:

1. Dynamic Permission Management:
```typescript
interface DynamicPermission {
  id: string;
  name: string;
  scope: 'GLOBAL' | 'CAMPUS' | 'PROGRAM' | 'CLASS';
  conditions?: {
    type: 'TIME' | 'LOCATION' | 'RESOURCE';
    value: any;
  }[];
}
```

2. Granular Access Control:
```typescript
interface AccessControl {
  resource: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  scope: string;
  conditions: {
    field: string;
    operator: 'EQ' | 'GT' | 'LT' | 'IN';
    value: any;
  }[];
}
```

3. Role Inheritance System:
```typescript
interface RoleInheritance {
  parent: string;
  child: string;
  overrides?: {
    permission: string;
    allow: boolean;
  }[];
}
```

4. Context-Aware Permissions:
```typescript
interface ContextualPermission {
  basePermission: Permission;
  contextType: 'TIME' | 'LOCATION' | 'RESOURCE';
  evaluator: (context: any) => boolean;
}
```

Recommendations:

1. Permission Caching:
```typescript
class PermissionCache {
  private cache: Map<string, Set<Permission>>;
  private ttl: number;

  async getUserPermissions(userId: string): Promise<Set<Permission>> {
    if (this.cache.has(userId)) {
      return this.cache.get(userId)!;
    }
    // Fetch and cache permissions
  }
}
```

2. Audit Logging:
```typescript
interface PermissionAudit {
  userId: string;
  action: string;
  resource: string;
  granted: boolean;
  timestamp: Date;
  context: Record<string, any>;
}
```

3. Role Templates:
```typescript
interface RoleTemplate {
  name: string;
  basePermissions: Permission[];
  customizablePermissions: Permission[];
  restrictions: {
    maxUsers?: number;
    timeRestrictions?: TimeRange[];
  };
}
```

Conclusion:
The current implementation provides a solid foundation for RBAC but could benefit from:

1. Enhanced Scalability:
- Dynamic permission management
- Role inheritance system
- Granular access control

2. Performance Optimization:
- Permission caching
- Bulk permission checks
- Optimized database queries

3. Maintainability:
- Audit logging
- Role templates
- Documentation

4. Security:
- Context-aware permissions
- Time-based restrictions
- Resource-level access control

Next Steps:
1. Implement dynamic permission management
2. Add role inheritance system
3. Enhance audit logging
4. Optimize permission caching
5. Add context-aware permissions
6. Implement role templates

I'll outline the implementation for dynamic permission management and role management UI, along with the other requested features:

1. Dynamic Permission Management UI:
```typescript
// src/components/dashboard/settings/permissions/PermissionMatrix.tsx
import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface PermissionMatrixProps {
  roles: Role[];
  permissions: Permission[];
  contexts: PermissionContext[];
}

export const PermissionMatrix = ({ roles, permissions, contexts }: PermissionMatrixProps) => {
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({});

  const columns = [
    {
      id: 'permission',
      header: 'Permission',
      cell: (row: Permission) => row.name
    },
    ...roles.map(role => ({
      id: role.id,
      header: role.name,
      cell: (row: Permission) => (
        <Checkbox
          checked={matrix[role.id]?.[row.id] || false}
          onCheckedChange={(checked) => {
            setMatrix(prev => ({
              ...prev,
              [role.id]: {
                ...prev[role.id],
                [row.id]: checked
              }
            }));
          }}
        />
      )
    }))
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={permissions}
      />
      <Button onClick={() => handleSaveMatrix(matrix)}>
        Save Permissions
      </Button>
    </div>
  );
};
```

2. Role Inheritance System:
```typescript
// src/lib/permissions/RoleInheritance.ts
interface RoleHierarchy {
  parent: string;
  children: string[];
  overrides?: {
    permission: string;
    allow: boolean;
  }[];
}

export class RoleInheritanceManager {
  private hierarchy: Map<string, RoleHierarchy>;
  private cache: PermissionCache;

  constructor() {
    this.hierarchy = new Map();
    this.cache = new PermissionCache();
  }

  async resolvePermissions(roleId: string): Promise<Set<Permission>> {
    const role = this.hierarchy.get(roleId);
    if (!role) return new Set();

    const parentPermissions = await this.getParentPermissions(role.parent);
    const directPermissions = await this.cache.getRolePermissions(roleId);
    
    return new Set([...parentPermissions, ...directPermissions]);
  }
}
```

3. Enhanced Audit Logging:
```typescript
// src/lib/audit/AuditLogger.ts
interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  context: {
    roleId?: string;
    permissionId?: string;
    changes?: Record<string, any>;
  };
  timestamp: Date;
  metadata: Record<string, any>;
}

export class AuditLogger {
  async logPermissionChange(params: {
    userId: string;
    roleId: string;
    permissionId: string;
    action: 'GRANT' | 'REVOKE';
    context?: Record<string, any>;
  }) {
    const log: AuditLog = {
      userId: params.userId,
      action: `PERMISSION_${params.action}`,
      resource: 'permission',
      context: {
        roleId: params.roleId,
        permissionId: params.permissionId,
      },
      timestamp: new Date(),
      metadata: params.context || {},
    };

    await prisma.auditLog.create({ data: log });
  }
}
```

4. Permission Cache Optimization:
```typescript
// src/lib/cache/PermissionCache.ts
import { LRUCache } from 'lru-cache';

export class PermissionCache {
  private cache: LRUCache<string, Set<Permission>>;
  
  constructor() {
    this.cache = new LRUCache({
      max: 500,
      ttl: 1000 * 60 * 5, // 5 minutes
    });
  }

  async getRolePermissions(roleId: string): Promise<Set<Permission>> {
    const cacheKey = `role:${roleId}:permissions`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) return cached;

    const permissions = await this.fetchPermissionsFromDb(roleId);
    this.cache.set(cacheKey, permissions);
    
    return permissions;
  }
}
```

5. Context-Aware Permissions:
```typescript
// src/lib/permissions/ContextualPermissions.ts
interface PermissionContext {
  type: 'TIME' | 'LOCATION' | 'RESOURCE' | 'SCOPE';
  condition: {
    operator: 'EQ' | 'GT' | 'LT' | 'IN';
    value: any;
  };
}

export class ContextualPermissionManager {
  async evaluatePermission(
    userId: string,
    permission: Permission,
    context: PermissionContext
  ): Promise<boolean> {
    const hasBasePermission = await this.checkBasePermission(userId, permission);
    if (!hasBasePermission) return false;

    return this.evaluateContext(permission, context);
  }

  private async evaluateContext(
    permission: Permission,
    context: PermissionContext
  ): Promise<boolean> {
    switch (context.type) {
      case 'TIME':
        return this.evaluateTimeContext(context.condition);
      case 'LOCATION':
        return this.evaluateLocationContext(context.condition);
      case 'RESOURCE':
        return this.evaluateResourceContext(context.condition);
      default:
        return true;
    }
  }
}
```

6. Role Templates UI:
```typescript
// src/components/dashboard/settings/roles/RoleTemplateManager.tsx
interface RoleTemplate {
  name: string;
  description: string;
  basePermissions: string[];
  contextRules: PermissionContext[];
  inheritance?: string[];
}

export const RoleTemplateManager = () => {
  const [templates, setTemplates] = useState<RoleTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<RoleTemplate | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map(template => (
              <div key={template.name} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
                <Button onClick={() => setSelectedTemplate(template)}>
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <RoleTemplateEditor
          template={selectedTemplate}
          onSave={handleSaveRole}
          onCancel={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
};
```

Integration with API:
```typescript
// src/server/api/routers/permission.ts
export const permissionRouter = createTRPCRouter({
  createWithContext: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      contexts: z.array(z.object({
        type: z.enum(['TIME', 'LOCATION', 'RESOURCE', 'SCOPE']),
        condition: z.object({
          operator: z.enum(['EQ', 'GT', 'LT', 'IN']),
          value: z.any()
        })
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const permission = await ctx.prisma.permission.create({
        data: {
          name: input.name,
          description: input.description,
          contexts: input.contexts
        }
      });

      await ctx.audit.log({
        action: 'PERMISSION_CREATE',
        userId: ctx.session.user.id,
        resource: permission.id
      });

      return permission;
    })
});
```

This implementation provides:
1. Visual permission matrix for easy management
2. Role inheritance system with override support
3. Detailed audit logging
4. Optimized permission caching
5. Context-aware permission evaluation
6. Role template management

Next steps:
1. Implement UI for context rules
2. Add batch permission updates
3. Enhance template customization
4. Add permission analytics
5. Implement role conflict resolution
6. Add permission dependency tracking