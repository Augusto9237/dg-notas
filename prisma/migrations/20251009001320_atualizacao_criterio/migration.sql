/*
  Warnings:

  - Added the required column `pontuacaoMax` to the `Criterio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Criterio" ADD COLUMN     "pontuacaoMax" INTEGER NOT NULL;
