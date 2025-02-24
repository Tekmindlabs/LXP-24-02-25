import { RoleTemplate } from '../types/roles';

export class RoleTemplateService {
  private static templates: Map<string, RoleTemplate> = new Map();

  static async loadTemplates(): Promise<void> {
    try {
      // In a real implementation, this would load from your templates directory
      const templateFiles = [
        await import('../config/role-templates/base-instructor.json'),
        // Add other template imports
      ];

      templateFiles.forEach(template => {
        this.templates.set(template.name, template);
      });
    } catch (error) {
      console.error('Error loading role templates:', error);
    }
  }

  static getTemplate(name: string): RoleTemplate | undefined {
    return this.templates.get(name);
  }

  static getAllTemplates(): RoleTemplate[] {
    return Array.from(this.templates.values());
  }

  static validateTemplate(template: RoleTemplate): boolean {
    // Add validation logic based on your schema
    return true;
  }
}
