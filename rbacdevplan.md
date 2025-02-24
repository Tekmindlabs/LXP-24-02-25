# RBAC Development Plan: Unified Role and Permission System

## 1. Current Implementation Overview

### 1.1. Core RBAC Structure
- **Roles:** Super Admin, Admin, Teacher, Student, etc. are currently defined as core roles.
- **Permissions:** Permissions are associated with these core roles, controlling access to different features and functionalities.
- **Implementation:**  The current RBAC is implemented using [mention specific files or components if known, e.g., `src/server/auth.ts`, `src/utils/permissions.ts`].

### 1.2. Campus Role Implementation
- **Roles:** Campus Admin, Campus Teacher, Campus Student, and other campus-specific roles are implemented separately.
- **Permissions:** Campus roles have their own set of permissions, often overlapping or mirroring core role permissions but scoped to campus-level resources.
- **Implementation:** Campus roles and permissions are managed in [mention specific files or components if known, e.g., `prisma/seeds/campus-roles.ts`, `src/app/dashboard/campus-admin`].

### 1.3. Permission Management
- **Static Permissions:** Permissions are largely statically defined in code, making it difficult to add or modify permissions without code changes.
- **Role Assignment:** Role assignment is done through [describe current role assignment mechanism, e.g., database seeds, admin panel].

### 1.4. Limitations and Challenges
- **Lack of Flexibility:**  Adding new roles or modifying permissions requires code changes and deployments.
- **Duplication:**  Permissions for core and campus roles are often duplicated, leading to maintenance overhead.
- **Scalability:**  Managing permissions across multiple campuses and evolving requirements is becoming complex.
- **Limited Customization:**  Admins cannot easily create custom roles with specific permission sets.

## 2. Proposed Unified RBAC System

### 2.1. Architecture Diagram
```mermaid
graph LR
    User --> RoleAssignment
    RoleAssignment --> Role
    Role --> Permission
    Permission --> Resource
    RoleClass(Core Roles & Campus Roles) --> Role
    PermissionClass(Core Permissions & Campus Permissions) --> Permission
    subgraph Core RBAC
        CoreRoles[Core Roles (e.g., Admin, Teacher)]
        CorePermissions[Core Permissions (e.g., manageUsers, createCourse)]
    end
    subgraph Campus RBAC
        CampusRoles[Campus Roles (e.g., Campus Admin, Campus Teacher)]
        CampusPermissions[Campus Permissions (e.g., manageCampusBuildings, viewStudentAttendance)]
    end
    RoleClass --> CoreRoles & CampusRoles
    PermissionClass --> CorePermissions & CampusPermissions
    Resource[Resources (e.g., Users, Courses, Buildings, Classrooms)]
```
*[Diagram Explanation: This diagram illustrates the unified RBAC system. Users are assigned roles, which are composed of permissions. Roles and Permissions are categorized into Core and Campus types to manage both global and campus-specific access control. Resources are the entities being protected by the RBAC system.]*


### 2.2. Key Components

- **UnifiedRoleManagement Component:** A new component to manage both core and campus roles in a single interface.
- **DynamicPermissionMatrix UI:**  A user-friendly UI to define and manage permissions for roles using a matrix format.
- **Role Template System:** Predefined role templates for common role configurations to streamline role creation.
- **Campus Permission Scope:**  Mechanism to scope permissions to specific campuses, ensuring data isolation and access control.
- **Multi-Campus Role Assignment:**  Ability to assign users to roles across multiple campuses.
- **Permission Inheritance:**  Implement permission inheritance to simplify role definitions and reduce redundancy.
- **Role Hierarchy Visualization:**  Visual representation of role hierarchies for better understanding and management.
- **Audit Trail Implementation:**  Track role and permission changes for security and compliance.

### 2.3. Integration Points
- **Authentication Middleware (`src/middleware.ts`, `src/server/auth.ts`):** Integrate the unified RBAC system into the authentication middleware to enforce permissions on API endpoints and application routes.
- **Database Schema (`prisma/schema.prisma`):** Update the database schema to support the new RBAC entities (Roles, Permissions, RoleAssignments).
- **API Endpoints (`src/app/api/`):** Modify API endpoints to leverage the unified RBAC system for authorization.
- **Admin Dashboard (`src/app/dashboard/campus-admin/`):** Integrate the UnifiedRoleManagement component into the admin dashboard.
- **Permissions Utility (`src/utils/permissions.ts`):** Update or replace existing permission utility functions to work with the new RBAC system.


## 3. Implementation Tasks

### Task 1: Unified Role Management Component
- **Description:** Create a React component (`src/components/dashboard/UnifiedRoleManagement.tsx`) to manage roles (create, read, update, delete) for both core and campus contexts.
- **Details:**
    - UI for listing existing roles with filters for core/campus roles.
    - Form for creating new roles, specifying role type (core/campus), name, description.
    - Form for editing existing roles.
    - Integration with backend API for role management.
- **Estimated Effort:** [Estimate effort in hours/days]

### Task 2: Dynamic Permission Matrix UI
- **Description:** Develop a reusable React component (`src/components/ui/DynamicPermissionMatrix.tsx`) that provides a dynamic matrix UI for assigning permissions to roles.
- **Details:**
    - Matrix with permissions as rows and roles as columns (or vice versa).
    - Checkboxes or toggle switches to assign/unassign permissions.
    - Search and filter functionality for permissions and roles.
    - Ability to group permissions by category.
    - Integration with backend API to save permission assignments.
- **Estimated Effort:** [Estimate effort in hours/days]

### Task 3: Role Template System
- **Description:** Implement a system for role templates to predefine common role configurations.
- **Details:**
    - Define a schema for role templates (e.g., JSON files in `src/config/role-templates/`).
    - UI in UnifiedRoleManagement to create roles from templates.
    - Templates for common roles like "Campus Admin", "Subject Teacher", etc.
    - Ability to customize roles created from templates.
- **Estimated Effort:** [Estimate effort in hours/days]

### Task 4: Campus Permission Scope
- **Description:** Implement a mechanism to scope permissions to specific campuses.
- **Details:**
    - Modify database schema to include campus scope for permissions or role assignments.
    - Update backend logic to enforce campus-scoped permissions.
    - UI in DynamicPermissionMatrix to define campus scope for permissions.
- **Estimated Effort:** [Estimate effort in hours/days]

### Task 5: Multi-Campus Role Assignment
- **Description:**  Enable assigning users to roles across multiple campuses.
- **Details:**
    - Modify database schema to support multi-campus role assignments.
    - UI in UnifiedRoleManagement to assign roles to users for specific campuses.
    - Backend logic to handle user roles in multi-campus scenarios.
- **Estimated Effort:** [Estimate effort in hours/days]

### Task 6: Permission Inheritance
- **Description:** Implement permission inheritance to create hierarchical roles.
- **Details:**
    - Define inheritance relationships between roles (e.g., "Campus Admin" inherits from "Admin").
    - Backend logic to resolve inherited permissions.
    - UI to visualize and manage role inheritance.
- **Estimated Effort:** [Estimate effort in hours/days]

### Task 7: Role Hierarchy Visualization
- **Description:** Create a UI component (`src/components/dashboard/RoleHierarchyVisualization.tsx`) to visualize the role hierarchy and permission inheritance.
- **Details:**
    - Tree-like visualization of roles and their relationships.
    - Display inherited permissions for each role.
    - Interactive elements to explore role details.
- **Estimated Effort:** [Estimate effort in hours/days]

### Task 8: Audit Trail Implementation
- **Description:** Implement an audit trail to track changes to roles and permissions.
- **Details:**
    - Database table to store audit logs (timestamp, user, action, role/permission affected, changes).
    - Backend logic to log role and permission changes.
    - UI in UnifiedRoleManagement to view audit logs.
- **Estimated Effort:** [Estimate effort in hours/days]

### Task 9: Documentation Updates
- **Description:** Update project documentation (`README.md`, `docs/rbac.md`) to reflect the new unified RBAC system.
- **Details:**
    - Document the new architecture, components, and implementation details.
    - Provide usage examples and best practices.
    - Update API documentation related to RBAC.
- **Estimated Effort:** [Estimate effort in hours/days]

### Task 10: Testing Strategy
- **Description:** Define a comprehensive testing strategy for the unified RBAC system.
- **Details:**
    - Unit tests for individual components (UnifiedRoleManagement, DynamicPermissionMatrix, etc.).
    - Integration tests for API endpoints and backend logic.
    - End-to-end tests for user workflows and permission enforcement.
    - Test cases for different role types, permission scopes, and inheritance scenarios.
- **Estimated Effort:** [Estimate effort in hours/days]


## 4. Migration Plan

### 4.1. Data Migration Strategy
- **Roles and Permissions:**  [Describe how existing roles and permissions will be migrated to the new unified system. E.g., script to migrate data from old tables to new tables, mapping existing permissions to new permission structure].
- **Role Assignments:** [Describe how existing role assignments will be migrated. E.g., script to migrate user role assignments to the new RoleAssignment entity].

### 4.2. API Versioning
- **Versioned APIs:** Consider versioning RBAC-related APIs to ensure backward compatibility during the migration phase.
- **Deprecation Notices:** Provide clear deprecation notices for old RBAC APIs.

### 4.3. Deprecation Timeline
- **Phase-out Plan:** Define a timeline for phasing out the old RBAC system and fully transitioning to the unified system.
- **Communication:** Communicate the migration plan and timeline to stakeholders.


## 5. Future Enhancements

### 5.1. Role-Based Analytics
- **Description:** Implement analytics dashboards to track role usage, permission effectiveness, and potential security risks based on role assignments.

### 5.2. Permission Optimization
- **Description:** Analyze permission usage patterns to identify redundant or unnecessary permissions and optimize the permission set for each role.

### 5.3. AI-Powered Role Suggestions
- **Description:** Explore using AI to suggest optimal role assignments and permission configurations based on user activity and organizational structure.

---

*This document outlines the development plan for a unified RBAC system. Each task will be further broken down into smaller sub-tasks during the implementation phase.*
