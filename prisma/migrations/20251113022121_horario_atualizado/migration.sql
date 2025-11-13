/*
  Warnings:

  - You are about to drop the column `diaSemanaId` on the `SlotHorario` table. All the data in the column will be lost.
  - Added the required column `diaSemanaId` to the `Horario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."SlotHorario" DROP CONSTRAINT "SlotHorario_diaSemanaId_fkey";

-- DropIndex
DROP INDEX "public"."DiaSemana_nome_key";

-- AlterTable
ALTER TABLE "Horario" ADD COLUMN     "diaSemanaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SlotHorario" DROP COLUMN "diaSemanaId";

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_diaSemanaId_fkey" FOREIGN KEY ("diaSemanaId") REFERENCES "DiaSemana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
