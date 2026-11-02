/*
  Warnings:

  - You are about to drop the `Progresso` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusExercicio" AS ENUM ('ENVIADA', 'CORRIGIDA');

-- DropForeignKey
ALTER TABLE "public"."Progresso" DROP CONSTRAINT "Progresso_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Progresso" DROP CONSTRAINT "Progresso_videoaulaId_fkey";

-- DropTable
DROP TABLE "public"."Progresso";

-- CreateTable
CREATE TABLE "Exercicio" (
    "id" SERIAL NOT NULL,
    "videoaulaId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "notaMaxima" INTEGER NOT NULL DEFAULT 100,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissaoExercicio" (
    "id" SERIAL NOT NULL,
    "exercicioId" INTEGER NOT NULL,
    "alunoId" TEXT NOT NULL,
    "professorId" TEXT,
    "resposta" TEXT NOT NULL,
    "correcao" TEXT,
    "feedback" TEXT,
    "nota" INTEGER,
    "status" "StatusExercicio" NOT NULL DEFAULT 'ENVIADA',
    "corrigidaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubmissaoExercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressoVideoaula" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "videoaulaId" INTEGER NOT NULL,
    "posicaoSegundos" INTEGER NOT NULL DEFAULT 0,
    "concluidoEm" TIMESTAMP(3),
    "ultimoAcessoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressoVideoaula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CriterioAvaliacaoSubmissoes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CriterioAvaliacaoSubmissoes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exercicio_videoaulaId_key" ON "Exercicio"("videoaulaId");

-- CreateIndex
CREATE INDEX "Exercicio_videoaulaId_ordem_idx" ON "Exercicio"("videoaulaId", "ordem");

-- CreateIndex
CREATE INDEX "SubmissaoExercicio_alunoId_status_idx" ON "SubmissaoExercicio"("alunoId", "status");

-- CreateIndex
CREATE INDEX "SubmissaoExercicio_professorId_status_idx" ON "SubmissaoExercicio"("professorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissaoExercicio_exercicioId_alunoId_key" ON "SubmissaoExercicio"("exercicioId", "alunoId");

-- CreateIndex
CREATE INDEX "ProgressoVideoaula_userId_ultimoAcessoEm_idx" ON "ProgressoVideoaula"("userId", "ultimoAcessoEm");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressoVideoaula_userId_videoaulaId_key" ON "ProgressoVideoaula"("userId", "videoaulaId");

-- CreateIndex
CREATE INDEX "_CriterioAvaliacaoSubmissoes_B_index" ON "_CriterioAvaliacaoSubmissoes"("B");

-- AddForeignKey
ALTER TABLE "Exercicio" ADD CONSTRAINT "Exercicio_videoaulaId_fkey" FOREIGN KEY ("videoaulaId") REFERENCES "Videoaula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissaoExercicio" ADD CONSTRAINT "SubmissaoExercicio_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissaoExercicio" ADD CONSTRAINT "SubmissaoExercicio_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissaoExercicio" ADD CONSTRAINT "SubmissaoExercicio_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressoVideoaula" ADD CONSTRAINT "ProgressoVideoaula_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressoVideoaula" ADD CONSTRAINT "ProgressoVideoaula_videoaulaId_fkey" FOREIGN KEY ("videoaulaId") REFERENCES "Videoaula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CriterioAvaliacaoSubmissoes" ADD CONSTRAINT "_CriterioAvaliacaoSubmissoes_A_fkey" FOREIGN KEY ("A") REFERENCES "CriterioAvaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CriterioAvaliacaoSubmissoes" ADD CONSTRAINT "_CriterioAvaliacaoSubmissoes_B_fkey" FOREIGN KEY ("B") REFERENCES "SubmissaoExercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
