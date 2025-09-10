/*
  Warnings:

  - You are about to drop the column `tema` on the `Avaliacao` table. All the data in the column will be lost.
  - Added the required column `temaId` to the `Avaliacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Avaliacao" DROP COLUMN "tema",
ADD COLUMN     "temaId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Avaliacao" ADD CONSTRAINT "Avaliacao_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "public"."Tema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
