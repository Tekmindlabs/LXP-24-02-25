-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('CORE', 'CAMPUS');

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "type" "RoleType" NOT NULL DEFAULT 'CAMPUS',
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
