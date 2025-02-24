export interface RoleTemplate {
  name: string;
  description: string;
  context: 'core' | 'campus';
  permissions: string[];
}
