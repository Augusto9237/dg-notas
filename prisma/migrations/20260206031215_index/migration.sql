-- CreateIndex
CREATE INDEX "Avaliacao_status_idx" ON "Avaliacao"("status");

-- CreateIndex
CREATE INDEX "Avaliacao_alunoId_status_idx" ON "Avaliacao"("alunoId", "status");

-- CreateIndex
CREATE INDEX "Avaliacao_professorId_status_idx" ON "Avaliacao"("professorId", "status");

-- CreateIndex
CREATE INDEX "Avaliacao_createdAt_idx" ON "Avaliacao"("createdAt");

-- CreateIndex
CREATE INDEX "Avaliacao_temaId_status_idx" ON "Avaliacao"("temaId", "status");

-- CreateIndex
CREATE INDEX "user_email_role_idx" ON "user"("email", "role");

-- CreateIndex
CREATE INDEX "user_matriculado_idx" ON "user"("matriculado");
