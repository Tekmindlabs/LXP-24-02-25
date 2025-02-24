Based on the existing codebase and provided files, let me give you more aligned instructions for implementing role permissions:

1. **Update SuperAdminSidebar.tsx**
```typescript
// In src/components/dashboard/roles/super-admin/layout/SuperAdminSidebar.tsx

// Add to the existing menuItems array
{
  title: "Roles & Permissions",
  href: "/dashboard/super-admin/settings/roles", // Note the direct super-admin path
  icon: LuShieldCheck, // Import from react-icons/lu
},
```

2. **Create Role Management Page**
Create a new file at `src/app/dashboard/super-admin/settings/roles/page.tsx`:
```typescript
import { UnifiedRoleManagement } from "@/components/dashboard/UnifiedRoleManagement";
import { Card } from "@/components/ui/card";

export default function RolesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Roles & Permissions</h1>
        <p className="text-muted-foreground">
          Manage system and campus roles and their permissions
        </p>
      </div>
      <Card className="p-6">
        <UnifiedRoleManagement />
      </Card>
    </div>
  );
}
```

3. **The RoleForm Component**
Your existing `RoleForm.tsx` is already well-structured with:
- Form validation using react-hook-form and zod
- Permission selection using checkboxes
- Context selection (core/campus)
- Proper form controls and error handling

4. **Update UnifiedRoleManagement Component**
Your existing component already has:
- Role listing with context filtering
- CRUD operations
- Toast notifications
- Loading states

5. **Add Required API Routes**
Make sure these routes are defined in your `src/server/api/routers/role.ts`:
```typescript
export const roleRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }),

  create: protectedProcedure
    .input(roleFormSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.role.create({
        data: {
          name: input.name,
          description: input.description,
          context: input.context,
          permissions: {
            create: input.permissions.map((permissionId) => ({
              permission: {
                connect: { id: permissionId },
              },
            })),
          },
        },
      });
    }),

  // Add other existing routes
});
```

6. **Testing Flow**:
```typescript
// Test data for creating a role
const testRole = {
  name: "Campus Teacher",
  description: "Standard teacher role for campus operations",
  context: "campus",
  permissions: [
    "VIEW_CLASSES",
    "MANAGE_ATTENDANCE",
    "VIEW_STUDENTS"
  ]
};
```

7. **Permission Check Implementation**:
```typescript
// In your UnifiedRoleManagement.tsx
const { hasPermission } = usePermissions();

// Check before operations
{hasPermission('ROLE_MANAGE') && (
  <Button onClick={() => setShowCreateForm(true)}>
    <Plus className="mr-2 h-4 w-4" />
    Create Role
  </Button>
)}
```

8. **File Structure Verification**:
```
src/
├── app/
│   └── dashboard/
│       └── super-admin/
│           └── settings/
│               └── roles/
│                   └── page.tsx
├── components/
│   └── dashboard/
│       ├── UnifiedRoleManagement.tsx (existing)
│       ├── RoleForm.tsx (existing)
│       └── roles/
│           └── super-admin/
│               └── layout/
│                   └── SuperAdminSidebar.tsx (update)
└── server/
    └── api/
        └── routers/
            └── role.ts
```

This implementation aligns with your existing codebase and maintains consistency with your current patterns. The components are already well-structured - we just need to:

1. Add the sidebar menu item
2. Create the page component
3. Verify API routes
4. Test the complete flow

No need to create new form components as your existing ones already handle the requirements effectively.