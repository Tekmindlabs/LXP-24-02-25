RBAC Development Task List
This document outlines the tasks required to implement the unified RBAC system as described in rbacdevplan.md. Each task includes detailed instructions, considerations for component reusability, and guidance on using Shadcn UI components.

Task 1: Unified Role Management Component (src/components/dashboard/UnifiedRoleManagement.tsx)
Description: Create a React component to manage roles (create, read, update, delete) for both core and campus contexts.
Instructions:
UI Structure:
Use Shadcn UI's Table component to display a list of existing roles.
Implement filters for core/campus roles using Shadcn UI's Select component.
Use Shadcn UI's Button component for "Create New Role" action.
Form for Creating/Editing Roles:
Use Shadcn UI's Form component for creating and editing roles.
Include fields for:
Role Type (core/campus): Use Shadcn UI's RadioGroup or Select component.
Role Name: Use Shadcn UI's Input component.
Role Description: Use Shadcn UI's Textarea component.
Use Shadcn UI's Button component for "Save" and "Cancel" actions.
API Integration:
Implement API calls to create, read, update, and delete roles.
Handle success and error states using Shadcn UI's Toast component for notifications.
Component Reusability:
Design the component to be reusable across different dashboards or admin panels.
Consider creating separate components for role listing, role creation/editing form, and API integration logic.
Shadcn UI Components: Table, Select, Button, Form, Input, Textarea, RadioGroup, Toast

Task 2: Dynamic Permission Matrix UI (src/components/ui/DynamicPermissionMatrix.tsx)
Description: Develop a reusable React component that provides a dynamic matrix UI for assigning permissions to roles.
Instructions:
Matrix Structure:
Use a combination of Table and Checkbox components from Shadcn UI to create the permission matrix.
Display permissions as rows and roles as columns (or vice versa).
Permission Assignment:
Use Shadcn UI's Checkbox or Switch components to assign/unassign permissions.
Search and Filter:
Implement search and filter functionality for permissions and roles using Shadcn UI's Input and Select components.
Grouping Permissions:
Allow grouping permissions by category using Shadcn UI's Accordion component.
API Integration:
Implement API calls to save permission assignments.
Handle success and error states using Shadcn UI's Toast component for notifications.
Component Reusability:
Design the component to be reusable for different types of resources and roles.
Consider creating separate components for matrix rendering, permission assignment logic, and API integration.
Shadcn UI Components: Table, Checkbox, Switch, Input, Select, Accordion, Toast

Task 3: Role Template System
Description: Implement a system for role templates to predefine common role configurations.
Instructions:
Template Schema:
Define a JSON schema for role templates (e.g., in src/config/role-templates/).
Include fields for role name, description, permissions, and other relevant settings.
UI Integration:
Integrate the role template system into the UnifiedRoleManagement component.
Use Shadcn UI's Select component to allow users to choose a role template.
Populate the role creation form with the selected template's data.
Customization:
Allow users to customize roles created from templates.
Provide options to override template settings and add/remove permissions.
Component Reusability:
Design the template loading and application logic to be reusable for different role types.
Shadcn UI Components: Select, Form, Input, Textarea, Checkbox

Task 4: Campus Permission Scope
Description: Implement a mechanism to scope permissions to specific campuses.
Instructions:
Database Schema Modification:
Modify the database schema to include a campus scope for permissions or role assignments.
Add a campusId field to the RolePermission or CampusRole model in prisma/schema.prisma.
Backend Logic Update:
Update the backend logic to enforce campus-scoped permissions.
Filter permissions based on the user's campus affiliation.
UI Integration:
Integrate campus scope definition into the DynamicPermissionMatrix component.
Use Shadcn UI's Select component to allow users to choose a campus for each permission.
Shadcn UI Components: Select

Task 5: Multi-Campus Role Assignment
Description: Enable assigning users to roles across multiple campuses.
Instructions:
Database Schema Modification:
Modify the database schema to support multi-campus role assignments.
Allow multiple CampusRole entries for a single user.
UI Integration:
Update the UnifiedRoleManagement component to allow assigning roles to users for specific campuses.
Use Shadcn UI's Select component to choose the campus for each role assignment.
Backend Logic Update:
Update the backend logic to handle user roles in multi-campus scenarios.
Ensure that users have access to resources only within their assigned campuses.
Shadcn UI Components: Select

Task 6: Permission Inheritance
Description: Implement permission inheritance to create hierarchical roles.
Instructions:
Inheritance Relationships:
Define inheritance relationships between roles (e.g., "Campus Admin" inherits from "Admin").
Add a parentId field to the Role model in prisma/schema.prisma.
Backend Logic:
Implement backend logic to resolve inherited permissions.
Recursively retrieve permissions from parent roles.
UI Visualization:
Update the RoleHierarchyVisualization component to visualize role inheritance.
Display inherited permissions for each role.

Task 7: Role Hierarchy Visualization (src/components/dashboard/RoleHierarchyVisualization.tsx)
Description: Create a UI component to visualize the role hierarchy and permission inheritance.
Instructions:
Tree Visualization:
Use a tree-like visualization to display roles and their relationships.
Consider using a library like react-treebeard or react-d3-tree.
Inherited Permissions:
Display inherited permissions for each role.
Use tooltips or expandable sections to show the source of each permission.
Interactive Elements:
Implement interactive elements to explore role details.
Allow users to expand/collapse roles and view their permissions.

Task 8: Audit Trail Implementation
Description: Implement an audit trail to track changes to roles and permissions.
Instructions:
Database Table:
Create a database table to store audit logs (timestamp, user, action, role/permission affected, changes).
Include fields for timestamp, userId, action, roleId, permissionId, and changes.
Backend Logic:
Implement backend logic to log role and permission changes.
Create audit log entries whenever a role or permission is created, updated, or deleted.
UI Integration:
Integrate audit log viewing into the UnifiedRoleManagement component.
Use Shadcn UI's Table component to display audit logs.

Task 9: Documentation Updates
Description: Update project documentation (README.md, docs/rbac.md) to reflect the new unified RBAC system.
Instructions:
Architecture Documentation:
Document the new architecture, components, and implementation details.
Usage Examples:
Provide usage examples and best practices.
API Documentation:
Update API documentation related to RBAC.

