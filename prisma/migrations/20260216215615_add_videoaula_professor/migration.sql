/*
  Warnings:

  - You are about to drop the `Videoaulas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_VideoaulasProfessor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_VideoaulasProfessor" DROP CONSTRAINT "_VideoaulasProfessor_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_VideoaulasProfessor" DROP CONSTRAINT "_VideoaulasProfessor_B_fkey";

-- DropTable
DROP TABLE "public"."Videoaulas";

-- DropTable
DROP TABLE "public"."_VideoaulasProfessor";

-- CreateTable
CREATE TABLE "Videoaula" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "materialComplementar" TEXT NOT NULL,
    "professorId" TEXT,

    CONSTRAINT "Videoaula_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Videoaula" ADD CONSTRAINT "Videoaula_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
