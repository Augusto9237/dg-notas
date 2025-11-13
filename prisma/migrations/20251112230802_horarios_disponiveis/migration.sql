/*
  Warnings:

  - Added the required column `diaSemanaId` to the `SlotHorario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SlotHorario" ADD COLUMN     "diaSemanaId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "SlotHorario" ADD CONSTRAINT "SlotHorario_diaSemanaId_fkey" FOREIGN KEY ("diaSemanaId") REFERENCES "DiaSemana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
