-- CreateTable
CREATE TABLE "Configuracao" (
    "id" SERIAL NOT NULL,
    "nomePlataforma" TEXT NOT NULL,
    "slogan" TEXT NOT NULL,
    "sobreCurso" TEXT NOT NULL,
    "emailContato" TEXT NOT NULL,
    "logoAplicativo" TEXT NOT NULL,
    "logoSistema" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);
