/*
  Warnings:

  - Added the required column `professorId` to the `Tema` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tema" ADD COLUMN     "professorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Tema" ADD CONSTRAINT "Tema_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
