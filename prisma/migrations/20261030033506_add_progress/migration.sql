/*
  Warnings:

  - You are about to drop the column `assistido` on the `Videoaula` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Videoaula" DROP COLUMN "assistido";

-- CreateTable
CREATE TABLE "Progresso" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "videoaulaId" INTEGER NOT NULL,
    "progresso" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "assistido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progresso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Progresso_userId_videoaulaId_key" ON "Progresso"("userId", "videoaulaId");

-- AddForeignKey
ALTER TABLE "Progresso" ADD CONSTRAINT "Progresso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progresso" ADD CONSTRAINT "Progresso_videoaulaId_fkey" FOREIGN KEY ("videoaulaId") REFERENCES "Videoaula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
