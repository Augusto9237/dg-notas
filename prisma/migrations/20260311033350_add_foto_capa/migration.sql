/*
  Warnings:

  - Added the required column `fotoCapa` to the `Configuracao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Configuracao" ADD COLUMN     "fotoCapa" TEXT NOT NULL;
