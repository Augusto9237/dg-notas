/*
  Warnings:

  - You are about to drop the column `slot` on the `Horario` table. All the data in the column will be lost.
  - The `status` column on the `Horario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[data,slotId]` on the table `Horario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slotId` to the `Horario` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Horario_data_slot_id_key";

-- AlterTable
ALTER TABLE "Horario" DROP COLUMN "slot",
ADD COLUMN     "slotId" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- DropEnum
DROP TYPE "public"."SlotHorario";

-- DropEnum
DROP TYPE "public"."StatusHorario";

-- CreateTable
CREATE TABLE "DiaSemana" (
    "id" SERIAL NOT NULL,
    "dia" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DiaSemana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlotHorario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlotHorario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiaSemana_nome_key" ON "DiaSemana"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Horario_data_slotId_key" ON "Horario"("data", "slotId");

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "SlotHorario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
