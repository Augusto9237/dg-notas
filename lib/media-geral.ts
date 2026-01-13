import { Avaliacao } from "@/app/generated/prisma";

export function calcularMedia(avaliacoes: Avaliacao[]): number {
  const somaNotas = avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.notaFinal, 0);
  const media = avaliacoes.length > 0 ? somaNotas / avaliacoes.length : 0;
  return media;
};

export function calcularMediaMensal(avaliacoes: Avaliacao[]) {
  const anomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const mediasMensais = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    month: anomes[i],
    media: 0,
    count: 0
  }));

  avaliacoes.forEach(avaliacao => {
    const data = new Date(avaliacao.createdAt);
    const mes = data.getMonth();
    mediasMensais[mes].media += avaliacao.notaFinal;
    mediasMensais[mes].count++;
  });

  return mediasMensais.map(item => ({
    id: item.id,
    month: item.month,
    media: item.count > 0 ? Math.round(item.media / item.count) : 0
  }));
}