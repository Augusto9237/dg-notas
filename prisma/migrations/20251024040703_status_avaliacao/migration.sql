-- CreateEnum
CREATE TYPE "StatusAvaliacao" AS ENUM ('ENVIADA', 'CORRIGIDA');

-- AlterTable
ALTER TABLE "Avaliacao" ADD COLUMN     "status" "StatusAvaliacao" NOT NULL DEFAULT 'ENVIADA';
