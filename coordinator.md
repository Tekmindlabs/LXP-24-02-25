After reviewing the provided code more closely, I notice that the issue with campus coordinator associations likely stems from how campus roles and permissions are being handled. Here's the detailed analysis:

1. **Campus Role Assignment**
In `CampusUserService.ts`, we see the role assignment logic:
```typescript
async assignCampusRole(userId: string, campusId: string, role: CampusRoleType): Promise<void> {
  try {
    const defaultPermissions = this.getDefaultPermissionsForRole(role);
    const validPermissions = defaultPermissions.filter(
      perm => this.allowedCampusPermissions.includes(perm)
    );

    await this.db.campusRole.create({
      data: {
        userId,
        campusId,
        role,
        permissions: validPermissions,
      },
    });
  } catch (error) {
    // Error handling
  }
}
```

2. **Campus Coordinator Interface**
In `types/campus.ts`, the coordinator profile is defined as:
```typescript
export interface CoordinatorProfile {
  id: string;
  userId: string;
  campusId: string;
  user: User;
  campus: Campus;
  status?: Status;
  designation?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

The root cause appears to be:

1. **Missing Role-Coordinator Link**: When a coordinator is created, there's no automatic creation of the corresponding campus role. The `CampusUserService` has the functionality to assign roles, but it's not being utilized in the coordinator creation flow.

2. **Incomplete Data Association**: The `CoordinatorProfile` interface shows that campus association should be mandatory (not optional), but the implementation might not be enforcing this.

To fix this, we need to:

1. **Update Coordinator Creation Flow**:
```typescript
// Add to coordinator creation service
async createCoordinator(data: CreateCoordinatorInput) {
  const coordinator = await this.db.coordinatorProfile.create({
    data: {
      ...data,
      campusId: data.campusId, // Ensure this is required for campus coordinators
    },
  });
  
  // Add campus role assignment
  await this.campusUserService.assignCampusRole(
    coordinator.userId,
    data.campusId,
    CampusRoleType.CAMPUS_PROGRAM_COORDINATOR
  );
  
  return coordinator;
}
```

2. **Ensure Campus Role Synchronization**:
```typescript
// Add to coordinator update service
async updateCoordinator(id: string, data: UpdateCoordinatorInput) {
  const coordinator = await this.db.coordinatorProfile.update({
    where: { id },
    data: {
      ...data,
      campusId: data.campusId,
    },
  });
  
  // Update campus role if campus changed
  if (data.campusId) {
    await this.campusUserService.updateCampusRole(
      coordinator.userId,
      data.campusId,
      CampusRoleType.CAMPUS_PROGRAM_COORDINATOR
    );
  }
  
  return coordinator;
}
```

3. **Add Data Validation**:
```typescript
// Add to coordinator schema
const coordinatorSchema = z.object({
  // ... other fields
  campusId: z.string().refine((val) => !!val, {
    message: "Campus ID is required for campus program coordinators"
  }),
});
```

These changes will ensure that:
1. Campus coordinators are properly associated with their campus
2. Corresponding campus roles are created/updated
3. Data consistency is maintained through proper validation

Would you like me to provide more specific implementation details for any of these areas?