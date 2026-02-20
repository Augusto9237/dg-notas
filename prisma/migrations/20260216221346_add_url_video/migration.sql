/*
  Warnings:

  - You are about to drop the column `materialComplementar` on the `Videoaula` table. All the data in the column will be lost.
  - Added the required column `urlVideo` to the `Videoaula` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Videoaula" DROP COLUMN "materialComplementar",
ADD COLUMN     "urlVideo" TEXT NOT NULL;
