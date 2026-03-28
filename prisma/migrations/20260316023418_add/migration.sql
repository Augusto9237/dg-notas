-- AlterTable
ALTER TABLE "Configuracao" ADD COLUMN     "coresSistema" TEXT[] DEFAULT ARRAY['#000000', '#ffffff', '#0066cc', '#999999']::TEXT[];
