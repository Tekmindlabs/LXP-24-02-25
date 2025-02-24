/*
  Warnings:

  - You are about to drop the column `permissions` on the `campus_roles` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `campus_roles` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `campus_roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "campus_features" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "campus_roles" DROP COLUMN "permissions",
DROP COLUMN "role",
ADD COLUMN     "roleId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "campus_roles" ADD CONSTRAINT "campus_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
