/*
  Warnings:

  - You are about to drop the column `deadline` on the `ClassActivity` table. All the data in the column will be lost.
  - You are about to drop the column `resources` on the `ClassActivity` table. All the data in the column will be lost.
  - You are about to drop the `ActivitySubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ActivitySubjects` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[roleId,permissionId,campusId]` on the table `role_permissions` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `type` on the `ClassActivity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `ClassActivity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `campusId` to the `classes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('CLASSROOM', 'LAB', 'ACTIVITY_ROOM', 'LECTURE_HALL');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ActivityScope" AS ENUM ('CURRICULUM', 'CLASS');

-- DropForeignKey
ALTER TABLE "ActivitySubmission" DROP CONSTRAINT "ActivitySubmission_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ActivitySubmission" DROP CONSTRAINT "ActivitySubmission_studentId_fkey";

-- DropForeignKey
ALTER TABLE "_ActivitySubjects" DROP CONSTRAINT "_ActivitySubjects_A_fkey";

-- DropForeignKey
ALTER TABLE "_ActivitySubjects" DROP CONSTRAINT "_ActivitySubjects_B_fkey";

-- DropIndex
DROP INDEX "role_permissions_roleId_permissionId_key";

-- AlterTable
ALTER TABLE "ClassActivity" DROP COLUMN "deadline",
DROP COLUMN "resources",
ADD COLUMN     "curriculumNodeId" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "ActivityType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ActivityStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Period" ADD COLUMN     "roomId" TEXT,
ALTER COLUMN "classroomId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "buildingId" TEXT,
ADD COLUMN     "campusId" TEXT NOT NULL,
ADD COLUMN     "roomId" TEXT;

-- AlterTable
ALTER TABLE "curriculum_nodes" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "role_permissions" ADD COLUMN     "campusId" TEXT;

-- DropTable
DROP TABLE "ActivitySubmission";

-- DropTable
DROP TABLE "_ActivitySubjects";

-- DropEnum
DROP TYPE "ActivitySubmissionStatus";

-- CreateTable
CREATE TABLE "campus_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campus_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campus_features" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "enableAfter" TIMESTAMP(3),
    "enabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campus_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campus_syncs" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campus_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Floor" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "buildingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Floor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "floorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "wingId" TEXT NOT NULL,
    "type" "RoomType" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "RoomStatus" NOT NULL,
    "resources" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassActivityInheritance" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "inherited" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ClassActivityInheritance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ActivityType" NOT NULL,
    "status" "ActivityStatus" NOT NULL,
    "scope" "ActivityScope" NOT NULL DEFAULT 'CURRICULUM',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT,
    "curriculumNodeId" TEXT,
    "configuration" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnifiedActivityResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,

    CONSTRAINT "UnifiedActivityResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnifiedActivitySubmission" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL,
    "content" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnifiedActivitySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnifiedActivityInheritance" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "inherited" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UnifiedActivityInheritance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassActivityResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,

    CONSTRAINT "ClassActivityResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassActivitySubmission" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL,
    "content" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassActivitySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "responseTime" DOUBLE PRECISION NOT NULL,
    "memoryUsage" DOUBLE PRECISION NOT NULL,
    "cpuUsage" DOUBLE PRECISION NOT NULL,
    "activeUsers" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "endpoint_metrics" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "totalRequests" INTEGER NOT NULL,
    "averageResponseTime" DOUBLE PRECISION NOT NULL,
    "errorRate" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "endpoint_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campus_features_campusId_featureKey_key" ON "campus_features"("campusId", "featureKey");

-- CreateIndex
CREATE UNIQUE INDEX "campus_syncs_campusId_key" ON "campus_syncs"("campusId");

-- CreateIndex
CREATE UNIQUE INDEX "Building_code_key" ON "Building"("code");

-- CreateIndex
CREATE INDEX "ClassActivityInheritance_activityId_idx" ON "ClassActivityInheritance"("activityId");

-- CreateIndex
CREATE INDEX "ClassActivityInheritance_classId_idx" ON "ClassActivityInheritance"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassActivityInheritance_activityId_classId_key" ON "ClassActivityInheritance"("activityId", "classId");

-- CreateIndex
CREATE INDEX "Activity_subjectId_idx" ON "Activity"("subjectId");

-- CreateIndex
CREATE INDEX "Activity_classId_idx" ON "Activity"("classId");

-- CreateIndex
CREATE INDEX "Activity_curriculumNodeId_idx" ON "Activity"("curriculumNodeId");

-- CreateIndex
CREATE INDEX "UnifiedActivityResource_activityId_idx" ON "UnifiedActivityResource"("activityId");

-- CreateIndex
CREATE INDEX "UnifiedActivitySubmission_activityId_idx" ON "UnifiedActivitySubmission"("activityId");

-- CreateIndex
CREATE INDEX "UnifiedActivitySubmission_studentId_idx" ON "UnifiedActivitySubmission"("studentId");

-- CreateIndex
CREATE INDEX "UnifiedActivityInheritance_activityId_idx" ON "UnifiedActivityInheritance"("activityId");

-- CreateIndex
CREATE INDEX "UnifiedActivityInheritance_classId_idx" ON "UnifiedActivityInheritance"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "UnifiedActivityInheritance_activityId_classId_key" ON "UnifiedActivityInheritance"("activityId", "classId");

-- CreateIndex
CREATE INDEX "ClassActivityResource_activityId_idx" ON "ClassActivityResource"("activityId");

-- CreateIndex
CREATE INDEX "ClassActivitySubmission_activityId_idx" ON "ClassActivitySubmission"("activityId");

-- CreateIndex
CREATE INDEX "ClassActivitySubmission_studentId_idx" ON "ClassActivitySubmission"("studentId");

-- CreateIndex
CREATE INDEX "performance_metrics_campusId_idx" ON "performance_metrics"("campusId");

-- CreateIndex
CREATE INDEX "performance_metrics_timestamp_idx" ON "performance_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "endpoint_metrics_campusId_idx" ON "endpoint_metrics"("campusId");

-- CreateIndex
CREATE INDEX "endpoint_metrics_path_idx" ON "endpoint_metrics"("path");

-- CreateIndex
CREATE UNIQUE INDEX "endpoint_metrics_campusId_path_method_key" ON "endpoint_metrics"("campusId", "path", "method");

-- CreateIndex
CREATE INDEX "ClassActivity_curriculumNodeId_idx" ON "ClassActivity"("curriculumNodeId");

-- CreateIndex
CREATE INDEX "Period_roomId_idx" ON "Period"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_campusId_key" ON "role_permissions"("roleId", "permissionId", "campusId");

-- AddForeignKey
ALTER TABLE "campus_roles" ADD CONSTRAINT "campus_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campus_roles" ADD CONSTRAINT "campus_roles_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campus_features" ADD CONSTRAINT "campus_features_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campus_syncs" ADD CONSTRAINT "campus_syncs_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Floor" ADD CONSTRAINT "Floor_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wing" ADD CONSTRAINT "Wing_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "Floor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_wingId_fkey" FOREIGN KEY ("wingId") REFERENCES "Wing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassActivity" ADD CONSTRAINT "ClassActivity_curriculumNodeId_fkey" FOREIGN KEY ("curriculumNodeId") REFERENCES "curriculum_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassActivityInheritance" ADD CONSTRAINT "ClassActivityInheritance_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ClassActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassActivityInheritance" ADD CONSTRAINT "ClassActivityInheritance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_curriculumNodeId_fkey" FOREIGN KEY ("curriculumNodeId") REFERENCES "curriculum_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnifiedActivityResource" ADD CONSTRAINT "UnifiedActivityResource_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnifiedActivitySubmission" ADD CONSTRAINT "UnifiedActivitySubmission_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnifiedActivitySubmission" ADD CONSTRAINT "UnifiedActivitySubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnifiedActivityInheritance" ADD CONSTRAINT "UnifiedActivityInheritance_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnifiedActivityInheritance" ADD CONSTRAINT "UnifiedActivityInheritance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassActivityResource" ADD CONSTRAINT "ClassActivityResource_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ClassActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassActivitySubmission" ADD CONSTRAINT "ClassActivitySubmission_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ClassActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassActivitySubmission" ADD CONSTRAINT "ClassActivitySubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
