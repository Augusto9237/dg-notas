-- CreateTable
CREATE TABLE "public"."Mentoria" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'agendada',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mentoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MentoriaAluno" (
    "mentoriaId" INTEGER NOT NULL,
    "alunoId" TEXT NOT NULL,

    CONSTRAINT "MentoriaAluno_pkey" PRIMARY KEY ("mentoriaId","alunoId")
);

-- AddForeignKey
ALTER TABLE "public"."MentoriaAluno" ADD CONSTRAINT "MentoriaAluno_mentoriaId_fkey" FOREIGN KEY ("mentoriaId") REFERENCES "public"."Mentoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MentoriaAluno" ADD CONSTRAINT "MentoriaAluno_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
