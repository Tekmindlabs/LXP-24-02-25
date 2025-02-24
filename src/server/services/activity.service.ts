import { PrismaClient, ActivityType, Prisma, type ClassActivity } from '@prisma/client';
import {
  ActivityScope,
  ActivityStatus,
  UnifiedActivity,
  FormData,
  BaseActivity,
  BaseConfiguration
} from '@/types/class-activity';

interface ActivityFilters {
  subjectId?: string;
  classId?: string;
  curriculumNodeId?: string;
  scope?: ActivityScope;
  isTemplate?: boolean;
  type?: ActivityType;
  status?: ActivityStatus;
  searchTerm?: string;
}

export class ActivityService {
  private activityCache = new Map<string, UnifiedActivity>();

  constructor(
    private readonly db: PrismaClient
  ) { }

  async createActivity_old(data: FormData): Promise<UnifiedActivity> {
    if (!data.subjectId) {
      throw new Error('Subject ID is required');
    }

    const activity = await this.db.classActivity.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        status: ActivityStatus.DRAFT,
        subjectId: data.subjectId,
        classId: data.classId,
        curriculumNodeId: data.curriculumNodeId,
        configuration: data.configuration as Prisma.JsonValue,
        resources: {
          create: data.resources
        }
      },
      include: {
        subject: true,
        class: true,
        resources: true
      }
    });

    const unifiedActivity: UnifiedActivity = {
      id: activity.id,
      title: activity.title,
      description: activity.description || '',
      type: activity.type,
      status: activity.status,
      scope: data.scope,
      isTemplate: data.isTemplate || false,
      subjectId: activity.subjectId,
      classId: activity.classId,
      curriculumNodeId: activity.curriculumNodeId,
      configuration: activity.configuration as BaseConfiguration,
      resources: activity.resources || [],
      subject: activity.subject,
      class: activity.class
    };

    return unifiedActivity;

    if (data.scope === ActivityScope.CURRICULUM && data.curriculumNodeId) {
      await this.createCurriculumInheritance(activity.id, data.subjectId);
    }

    return activity as UnifiedActivity;
  }

  async createActivity(data: FormData): Promise<UnifiedActivity> {
    const baseActivity = await this.createBaseActivity(data);
    return data.scope === ActivityScope.CURRICULUM
      ? this.extendForCurriculum(baseActivity)
      : this.extendForClass(baseActivity);
  }

  private async createBaseActivity(data: FormData): Promise<UnifiedActivity> {
    return this.createActivity_old(data);
  }

  private async extendForCurriculum(activity: UnifiedActivity): Promise<UnifiedActivity> {
    await this.createCurriculumInheritance(activity.id, activity.subjectId);
    
    return {
      ...activity,
      scope: ActivityScope.CURRICULUM
    };
  }

  private async extendForClass(activity: UnifiedActivity): Promise<UnifiedActivity> {
    if (!activity.classId) {
      throw new Error('Class ID is required for class activities');
    }

    return {
      ...activity,
      scope: ActivityScope.CLASS
    };
  }

  private buildWhereClause(filters: ActivityFilters) {
    return {
      AND: [
        filters.subjectId && { subjectId: filters.subjectId },
        filters.classId && { 
          OR: [
            { classId: filters.classId },
            {
              activityInheritance: {
                some: { classId: filters.classId }
              }
            }
          ]
        },
        filters.curriculumNodeId && { curriculumNodeId: filters.curriculumNodeId },
        filters.scope && { scope: filters.scope },
        filters.isTemplate !== undefined && { isTemplate: filters.isTemplate },
        filters.type && { type: filters.type },
        filters.status && { status: filters.status },
        filters.searchTerm && {
          OR: [
            { title: { contains: filters.searchTerm, mode: 'insensitive' } },
            { description: { contains: filters.searchTerm, mode: 'insensitive' } }
          ]
        }
      ].filter(Boolean)
    };
  }

  private getRelevantIncludes(filters: ActivityFilters) {
    return {
      subject: true,
      class: true,
      resources: true,
      curriculumNode: filters.scope === ActivityScope.CURRICULUM,
      classActivityInheritance: filters.classId ? {
        where: { classId: filters.classId }
      } : false
    };
  }

  private async createCurriculumInheritance(activityId: string, subjectId: string) {
    const classes = await this.db.class.findMany({
      where: { 
        subjectAssignments: { 
          some: { subjectId } 
        } 
      }
    });

    await this.db.classActivityInheritance.createMany({
      data: classes.map((cls) => ({
        activityId,
        classId: cls.id,
        inherited: true
      }))
    });
  }

  async getActivities(filters: ActivityFilters): Promise<UnifiedActivity[]> {
    return this.db.classActivity.findMany({
      where: this.buildWhereClause(filters),
      include: this.getRelevantIncludes(filters)
    }) as Promise<UnifiedActivity[]>;
  }

  async updateActivity(
    id: string, 
    data: Partial<FormData>
  ): Promise<UnifiedActivity> {
    const activity = await this.db.classActivity.update({
      where: { id },
      data: {
        ...data,
        resources: data.resources ? {
          deleteMany: {},
          create: data.resources
        } : undefined
      },
      include: {
        subject: true,
        class: true,
        resources: true
      }
    });

    return activity as UnifiedActivity;
  }

  async deleteActivity(id: string): Promise<void> {
    await this.db.classActivity.delete({
      where: { id }
    });
  }

  async cloneTemplate(
    templateId: string, 
    classId: string
  ): Promise<UnifiedActivity> {
    const template = await this.db.classActivity.findUnique({
      where: { id: templateId },
      include: {
        resources: true
      }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    const activity = await this.createActivity({
      ...template,
      classId,
      scope: ActivityScope.CLASS,
      isTemplate: false,
      resources: template.resources
    } as FormData);

    return activity;
  }
}