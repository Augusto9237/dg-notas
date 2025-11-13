-- CreateTable
CREATE TABLE "professor" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "professor_userId_key" ON "professor"("userId");

-- CreateIndex
CREATE INDEX "Horario_data_slotId_status_idx" ON "Horario"("data", "slotId", "status");

-- CreateIndex
CREATE INDEX "Horario_status_idx" ON "Horario"("status");

-- CreateIndex
CREATE INDEX "Mentoria_horarioId_status_idx" ON "Mentoria"("horarioId", "status");

-- AddForeignKey
ALTER TABLE "professor" ADD CONSTRAINT "professor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
