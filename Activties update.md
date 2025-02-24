Based on the codebase review and optimization recommendations, here's a detailed breakdown of required changes per file:

1. `/src/types/class-activity.ts`:
```typescript
// Add new base interfaces
interface BaseActivity {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  status: ActivityStatus;
  configuration: BaseConfiguration;
}

// Update configuration interface
interface BaseConfiguration {
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

// Update existing interfaces
interface UnifiedActivity extends BaseActivity {
  scope: ActivityScope;
  isTemplate: boolean;
  curriculumNodeId?: string;
  classId?: string;
}
```

2. `/src/server/services/activity.service.ts`:
```typescript
class EnhancedActivityService {
  constructor(private db: PrismaClient) {}

  // Enhanced creation method
  async createActivity(data: ActivityInput): Promise<UnifiedActivity> {
    const baseActivity = await this.createBaseActivity(data);
    return data.scope === ActivityScope.CURRICULUM 
      ? this.extendForCurriculum(baseActivity)
      : this.extendForClass(baseActivity);
  }

  // Optimized query builder
  private buildOptimizedQuery(filters: ActivityFilters) {
    return {
      where: this.buildWhereClause(filters),
      include: this.getRelevantIncludes(filters),
      orderBy: { createdAt: 'desc' }
    };
  }

  // Implement caching
  private activityCache = new Map<string, UnifiedActivity>();
}
```

3. `/src/server/api/routers/class-activity.ts`:
```typescript
// Update validation schemas
const enhancedConfigSchema = configurationSchema.extend({
  adaptiveLearning: z.object({
    difficultyLevel: z.number(),
    autoAdjust: z.boolean()
  }).optional(),
  interactivity: z.object({
    realTimeCollaboration: z.boolean(),
    peerReview: z.boolean()
  }).optional(),
  analytics: z.object({
    trackingEnabled: z.boolean(),
    metrics: z.array(z.string())
  }).optional()
});

// Implement selective loading
const getActivityWithRelations = async (id: string, relations: string[]) => {
  const basic = await prisma.classActivity.findUnique({
    where: { id },
    select: { id: true, title: true, type: true }
  });

  if (!basic) return null;

  const additionalData = await Promise.all(
    relations.map(relation => loadRelation(basic.id, relation))
  );

  return { ...basic, ...Object.assign({}, ...additionalData) };
};
```

4. `/src/components/dashboard/roles/super-admin/class-activity/ClassActivityForm.tsx`:
```typescript
// Implement ActivityFormManager
const ActivityFormManager = {
  baseFields: ['title', 'description', 'type'],
  curriculumExtension: ['learningObjectives', 'prerequisites'],
  classExtension: ['deadline', 'classGroups'],

  validateCommon(data: any) {
    // Common validation logic
  },
  validateScope(data: any, scope: ActivityScope) {
    // Scope-specific validation
  }
};

// Update form component
const ClassActivityForm: React.FC<Props> = ({ activityId, onClose }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: ActivityFormManager.getDefaultValues()
  });

  // Implement selective loading
  useEffect(() => {
    if (activityId) {
      loadActivityData(activityId).then(data => {
        form.reset(data);
      });
    }
  }, [activityId]);
};
```

5. Create new file `/src/utils/activity-cache.ts`:
```typescript
export const activityCache = {
  templates: new Map<string, UnifiedActivity>(),
  commonConfigs: new Map<string, BaseConfiguration>(),

  async getOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    if (this.templates.has(key)) {
      return this.templates.get(key) as T;
    }

    const data = await fetchFn();
    this.templates.set(key, data as UnifiedActivity);
    return data;
  },

  invalidate(key: string) {
    this.templates.delete(key);
    this.commonConfigs.delete(key);
  }
};
```

Implementation Instructions:

1. Type Updates:
- Update existing type definitions first
- Ensure backward compatibility
- Add new interfaces gradually

2. Service Layer:
- Implement enhanced service class
- Add caching mechanism
- Update query optimization

3. API Router:
- Update validation schemas
- Implement selective loading
- Add new endpoints for analytics

4. Form Components:
- Implement ActivityFormManager
- Update form validation
- Add new configuration fields

5. Caching:
- Implement caching utility
- Add cache invalidation
- Update service methods to use cache

This implementation provides:
- Better code organization
- Enhanced performance
- Improved feature set
- Better type safety
- Optimized data loading
- Efficient caching

Remember to:
- Update tests
- Maintain backward compatibility
- Document new features
- Update API documentation
- Monitor performance metrics


Yes, based on the proposed changes, we need to update several schema files and create new ones. Here's the breakdown:

1. **Prisma Schema Updates** (`prisma/schema.prisma`):
```prisma
// Add new fields to ClassActivity model
model ClassActivity {
  // Existing fields...
  
  // New fields for enhanced configuration
  adaptiveLearning Json?
  interactivity    Json?
  analytics        Json?
  
  // Template related fields
  isTemplate       Boolean   @default(false)
  templateId       String?   @map("template_id")
  template         ClassActivity? @relation("ActivityTemplate", fields: [templateId], references: [id])
  derivedActivities ClassActivity[] @relation("ActivityTemplate")
  
  // Cache related fields
  cacheKey         String?   @unique
  cacheExpiry      DateTime?
}

// New model for Activity Templates
model ActivityTemplate {
  id               String    @id @default(cuid())
  title            String
  description      String?
  type             String
  configuration    Json
  resources        Json?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

// New model for Activity Analytics
model ActivityAnalytics {
  id               String    @id @default(cuid())
  activityId       String
  activity         ClassActivity @relation(fields: [activityId], references: [id])
  metrics          Json
  trackingEnabled  Boolean   @default(true)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

2. **Migration File** (`prisma/migrations/[timestamp]_activity_enhancements.sql`):
```sql
-- AlterTable
ALTER TABLE "ClassActivity" ADD COLUMN "adaptiveLearning" JSONB;
ALTER TABLE "ClassActivity" ADD COLUMN "interactivity" JSONB;
ALTER TABLE "ClassActivity" ADD COLUMN "analytics" JSONB;
ALTER TABLE "ClassActivity" ADD COLUMN "isTemplate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ClassActivity" ADD COLUMN "templateId" TEXT;
ALTER TABLE "ClassActivity" ADD COLUMN "cacheKey" TEXT;
ALTER TABLE "ClassActivity" ADD COLUMN "cacheExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ActivityTemplate" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL,
  "configuration" JSONB NOT NULL,
  "resources" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ActivityTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityAnalytics" (
  "id" TEXT NOT NULL,
  "activityId" TEXT NOT NULL,
  "metrics" JSONB NOT NULL,
  "trackingEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ActivityAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassActivity_cacheKey_key" ON "ClassActivity"("cacheKey");

-- AddForeignKey
ALTER TABLE "ClassActivity" ADD CONSTRAINT "ClassActivity_templateId_fkey" 
FOREIGN KEY ("templateId") REFERENCES "ClassActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAnalytics" ADD CONSTRAINT "ActivityAnalytics_activityId_fkey" 
FOREIGN KEY ("activityId") REFERENCES "ClassActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

3. **Environment Variables** (`.env`):
```env
# Add cache-related environment variables
ACTIVITY_CACHE_TTL=3600
ACTIVITY_CACHE_SIZE=1000
```

4. **Configuration File** (`src/config/activity.config.ts`):
```typescript
export const activityConfig = {
  cache: {
    ttl: parseInt(process.env.ACTIVITY_CACHE_TTL || '3600'),
    maxSize: parseInt(process.env.ACTIVITY_CACHE_SIZE || '1000'),
  },
  analytics: {
    defaultMetrics: ['completion', 'timeSpent', 'score'],
    trackingInterval: 5000, // 5 seconds
  },
  template: {
    allowedTypes: ['QUIZ', 'ASSIGNMENT', 'PROJECT'],
    maxResources: 10,
  },
};
```

5. **Type Definitions** (`src/types/activity-analytics.ts`):
```typescript
export interface ActivityMetrics {
  completion: number;
  timeSpent: number;
  score?: number;
  attempts?: number;
  interactions?: number;
}

export interface AnalyticsConfig {
  trackingEnabled: boolean;
  metrics: string[];
  interval?: number;
  customTracking?: Record<string, boolean>;
}
```

Implementation Steps:

1. **Database Updates**:
```bash
# Generate migration
npx prisma generate

# Apply migration
npx prisma migrate dev --name activity_enhancements
```

2. **Type Safety**:
```bash
# Update TypeScript types
npx tsc --noEmit
```

3. **Cache Implementation**:
```bash
# Install required packages
npm install node-cache
```

4. **Testing Updates**:
```bash
# Create test files
touch src/__tests__/activity-cache.test.ts
touch src/__tests__/activity-analytics.test.ts
```

Remember to:

1. Backup database before migrations
2. Update API documentation
3. Add migration rollback plans
4. Update test suites
5. Document new configuration options
6. Update deployment scripts

These schema changes support:
- Enhanced activity configuration
- Template management
- Analytics tracking
- Caching system
- Performance optimization

The changes maintain backward compatibility while adding new features gradually.