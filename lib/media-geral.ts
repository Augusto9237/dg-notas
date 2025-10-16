import { Avaliacao } from "@/app/generated/prisma";

export function calcularMedia(avaliacoes: Avaliacao[]): number {
    const somaNotas = avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.notaFinal, 0);
    const media = avaliacoes.length > 0 ? somaNotas / avaliacoes.length : 0;
    return media;
  };