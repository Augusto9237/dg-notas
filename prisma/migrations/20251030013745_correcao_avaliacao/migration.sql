-- AlterTable
ALTER TABLE "Avaliacao" ADD COLUMN     "correcao" TEXT;

-- AlterTable
ALTER TABLE "Tema" ADD COLUMN     "disponivel" BOOLEAN NOT NULL DEFAULT true;
