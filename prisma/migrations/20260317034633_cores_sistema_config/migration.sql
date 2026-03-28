/*
  Warnings:

  - You are about to drop the column `coresSistema` on the `Configuracao` table. All the data in the column will be lost.
  - Added the required column `endereco` to the `Configuracao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `favicon` to the `Configuracao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `Configuracao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Configuracao" DROP COLUMN "coresSistema",
ADD COLUMN     "endereco" TEXT NOT NULL,
ADD COLUMN     "favicon" TEXT NOT NULL,
ADD COLUMN     "telefone" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CorSistema" (
    "id" SERIAL NOT NULL,
    "cor" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorSistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ConfiguracoesCoresSistema" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ConfiguracoesCoresSistema_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ConfiguracoesCoresSistema_B_index" ON "_ConfiguracoesCoresSistema"("B");

-- AddForeignKey
ALTER TABLE "_ConfiguracoesCoresSistema" ADD CONSTRAINT "_ConfiguracoesCoresSistema_A_fkey" FOREIGN KEY ("A") REFERENCES "Configuracao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConfiguracoesCoresSistema" ADD CONSTRAINT "_ConfiguracoesCoresSistema_B_fkey" FOREIGN KEY ("B") REFERENCES "CorSistema"("id") ON DELETE CASCADE ON UPDATE CASCADE;
