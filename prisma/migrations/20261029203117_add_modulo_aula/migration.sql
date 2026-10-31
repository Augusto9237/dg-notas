/*
  Warnings:

  - You are about to drop the `_ModuloToVideoaula` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `duracao` to the `Videoaula` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduloId` to the `Videoaula` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlThumbnail` to the `Videoaula` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_ModuloToVideoaula" DROP CONSTRAINT "_ModuloToVideoaula_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ModuloToVideoaula" DROP CONSTRAINT "_ModuloToVideoaula_B_fkey";

-- AlterTable
ALTER TABLE "Videoaula" ADD COLUMN     "assistido" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "duracao" INTEGER NOT NULL,
ADD COLUMN     "moduloId" INTEGER NOT NULL,
ADD COLUMN     "urlThumbnail" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."_ModuloToVideoaula";

-- AddForeignKey
ALTER TABLE "Videoaula" ADD CONSTRAINT "Videoaula_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
