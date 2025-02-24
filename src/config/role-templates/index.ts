import { RoleTemplate } from '@/types/roles';

export const roleTemplates: RoleTemplate[] = [
  {
    name: 'Campus Administrator',
    description: 'Full access to campus-specific resources and management',
    context: 'campus',
    permissions: [
      'campus.manage',
      'users.manage',
      'roles.manage',
      'classes.manage',
      'attendance.manage',
      'grades.manage',
      'calendar.manage',
      'reports.view',
      'settings.manage'
    ]
  },
  {
    name: 'Teacher',
    description: 'Access to teaching-related features and student management',
    context: 'campus',
    permissions: [
      'classes.view',
      'classes.edit',
      'attendance.manage',
      'grades.manage',
      'calendar.view',
      'students.view',
      'reports.view'
    ]
  },
  {
    name: 'Student',
    description: 'Access to learning resources and personal information',
    context: 'campus',
    permissions: [
      'classes.view',
      'grades.view',
      'calendar.view',
      'attendance.view'
    ]
  },
  {
    name: 'System Administrator',
    description: 'Full system access across all campuses',
    context: 'core',
    permissions: ['*']
  },
  {
    name: 'Content Manager',
    description: 'Manage content and resources across the platform',
    context: 'core',
    permissions: [
      'content.manage',
      'resources.manage',
      'knowledge-base.manage'
    ]
  }
];