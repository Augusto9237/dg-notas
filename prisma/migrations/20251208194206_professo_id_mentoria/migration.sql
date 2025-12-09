/*
  Warnings:

  - Added the required column `updatedAt` to the `Horario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Avaliacao" ADD COLUMN     "professorId" TEXT;

-- AlterTable
ALTER TABLE "Horario" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Mentoria" ADD COLUMN     "professorId" TEXT;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentoria" ADD CONSTRAINT "Mentoria_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
