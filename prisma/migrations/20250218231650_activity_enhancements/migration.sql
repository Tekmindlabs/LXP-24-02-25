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
