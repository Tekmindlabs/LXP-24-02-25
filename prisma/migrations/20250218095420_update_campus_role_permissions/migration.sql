-- AlterTable
ALTER TABLE "_ClassGroupToSubject" ADD CONSTRAINT "_ClassGroupToSubject_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ClassGroupToSubject_AB_unique";
