import { type ClassActivity, type Prisma } from "@prisma/client";
import { type ActivityType, type ActivityStatus, type ActivityMode, type ActivityScope } from "@prisma/client";

export { ActivityStatus, ActivityMode, ActivityScope } from "@prisma/client";

import { type Option } from "@/types";

// Add new base interfaces
export interface BaseActivity {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  status: ActivityStatus;
  configuration: BaseConfiguration;
}

// Update configuration interface
export interface BaseConfiguration {
  [key: string]: any; // Add index signature for Prisma JSON compatibility
  activityMode: ActivityMode;
  isGraded: boolean;
  adaptiveLearning?: {
    difficultyLevel: number;
    autoAdjust: boolean;
  };
  interactivity?: {
    realTimeCollaboration: boolean;
    peerReview: boolean;
  };
  analytics?: {
    trackingEnabled: boolean;
    metrics: string[];
  };
}

export interface FormData {
  title: string;
  description: string;
  type: ActivityType; // Updated to use ActivityType
  scope: ActivityScope;
  isTemplate?: boolean;
  subjectId: string; // Made required as it's needed for both class and curriculum activities
  classId?: string;
  curriculumNodeId?: string;
  configuration: BaseConfiguration;
  resources: Array<{
    title: string; // Added missing title field
    type: string;
    url: string;
  }>;
}

export interface ActivityResource {
  id: string;
  title: string; // Added missing title field
  type: string;
  url: string;
}

export interface UnifiedActivity extends BaseActivity {
  scope: ActivityScope;
  isTemplate: boolean;
  subjectId: string; // Made required
  classId?: string;
  curriculumNodeId?: string;
  resources: ActivityResource[];
  subject: any; // TODO: Replace with proper Subject type
  class?: any; // TODO: Replace with proper Class type
  curriculumNode?: any; // TODO: Replace with proper CurriculumNode type
}
