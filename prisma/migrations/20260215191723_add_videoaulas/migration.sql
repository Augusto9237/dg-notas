-- CreateTable
CREATE TABLE "Videoaulas" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "materialComplementar" TEXT NOT NULL,
    "professorId" INTEGER NOT NULL,

    CONSTRAINT "Videoaulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_VideoaulasProfessor" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_VideoaulasProfessor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_VideoaulasProfessor_B_index" ON "_VideoaulasProfessor"("B");

-- AddForeignKey
ALTER TABLE "_VideoaulasProfessor" ADD CONSTRAINT "_VideoaulasProfessor_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoaulasProfessor" ADD CONSTRAINT "_VideoaulasProfessor_B_fkey" FOREIGN KEY ("B") REFERENCES "Videoaulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
