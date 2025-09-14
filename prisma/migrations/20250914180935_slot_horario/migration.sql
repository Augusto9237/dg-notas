/*
  Warnings:

  - You are about to drop the column `data` on the `Mentoria` table. All the data in the column will be lost.
  - You are about to drop the column `hora` on the `Mentoria` table. All the data in the column will be lost.
  - The `status` column on the `Mentoria` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `MentoriaAluno` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[alunoId,horarioId]` on the table `Mentoria` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alunoId` to the `Mentoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horarioId` to the `Mentoria` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."StatusMentoria" AS ENUM ('AGENDADA', 'REALIZADA');

-- CreateEnum
CREATE TYPE "public"."SlotHorario" AS ENUM ('SLOT_15_00', 'SLOT_15_20', 'SLOT_15_40', 'SLOT_16_00', 'SLOT_16_20', 'SLOT_16_40');

-- CreateEnum
CREATE TYPE "public"."StatusHorario" AS ENUM ('OCUPADO', 'LIVRE');

-- DropForeignKey
ALTER TABLE "public"."MentoriaAluno" DROP CONSTRAINT "MentoriaAluno_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MentoriaAluno" DROP CONSTRAINT "MentoriaAluno_mentoriaId_fkey";

-- AlterTable
ALTER TABLE "public"."Mentoria" DROP COLUMN "data",
DROP COLUMN "hora",
ADD COLUMN     "alunoId" TEXT NOT NULL,
ADD COLUMN     "duracao" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "horarioId" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."StatusMentoria" NOT NULL DEFAULT 'AGENDADA';

-- DropTable
DROP TABLE "public"."MentoriaAluno";

-- CreateTable
CREATE TABLE "public"."Horario" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "slot" "public"."SlotHorario" NOT NULL,
    "status" "public"."StatusHorario" NOT NULL DEFAULT 'LIVRE',

    CONSTRAINT "Horario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Horario_data_slot_id_key" ON "public"."Horario"("data", "slot", "id");

-- CreateIndex
CREATE INDEX "Mentoria_status_idx" ON "public"."Mentoria"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Mentoria_alunoId_horarioId_key" ON "public"."Mentoria"("alunoId", "horarioId");

-- AddForeignKey
ALTER TABLE "public"."Mentoria" ADD CONSTRAINT "Mentoria_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mentoria" ADD CONSTRAINT "Mentoria_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "public"."Horario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
