/*
  Warnings:

  - You are about to drop the `professor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."professor" DROP CONSTRAINT "professor_userId_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "especialidade" TEXT,
ADD COLUMN     "telefone" TEXT;

-- DropTable
DROP TABLE "public"."professor";
