-- AlterTable
ALTER TABLE "Videoaula" ADD COLUMN     "tags" TEXT[];

-- CreateTable
CREATE TABLE "Modulo" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ModuloToVideoaula" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ModuloToVideoaula_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ModuloToVideoaula_B_index" ON "_ModuloToVideoaula"("B");

-- AddForeignKey
ALTER TABLE "_ModuloToVideoaula" ADD CONSTRAINT "_ModuloToVideoaula_A_fkey" FOREIGN KEY ("A") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModuloToVideoaula" ADD CONSTRAINT "_ModuloToVideoaula_B_fkey" FOREIGN KEY ("B") REFERENCES "Videoaula"("id") ON DELETE CASCADE ON UPDATE CASCADE;
