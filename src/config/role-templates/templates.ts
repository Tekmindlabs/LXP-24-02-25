import { z } from 'zod';

export const roleTemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  context: z.enum(['core', 'campus']),
  permissions: z.array(z.string()),
  defaultSettings: z.object({
    isActive: z.boolean().default(true),
    allowOverride: z.boolean().default(true),
  }).optional(),
});

export type RoleTemplate = z.infer<typeof roleTemplateSchema>;

export const defaultRoleTemplates: RoleTemplate[] = [
  {
    name: 'Campus Administrator',
    description: 'Full administrative access to campus-specific resources',
    context: 'campus',
    permissions: [
      'campus.manage',
      'users.manage',
      'roles.manage',
      'courses.manage',
      'calendar.manage',
      'reports.view',
    ],
  },
  {
    name: 'Teacher',
    description: 'Access to teaching and course management features',
    context: 'campus',
    permissions: [
      'courses.view',
      'courses.edit',
      'calendar.view',
      'calendar.edit',
      'grades.manage',
      'attendance.manage',
    ],
  },
  {
    name: 'Student',
    description: 'Basic access to learning resources and personal information',
    context: 'campus',
    permissions: [
      'courses.view',
      'calendar.view',
      'grades.view',
      'attendance.view',
    ],
  },
  {
    name: 'System Administrator',
    description: 'Full system-wide administrative access',
    context: 'core',
    permissions: ['*'],
    defaultSettings: {
      isActive: true,
      allowOverride: false,
    },
  },
];