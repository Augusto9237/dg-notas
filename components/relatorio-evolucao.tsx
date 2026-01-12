'use client'

import { ChartNoAxesCombined, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Label } from './ui/label'
import { useEffect, useState } from 'react'
import { listarMentoriasAluno } from '@/actions/mentoria'
import { Criterio, Prisma } from '@/app/generated/prisma'
import { ListarAvaliacoesAlunoId, ListarCriterios } from '@/actions/avaliacao'
import { CardCompetencia } from './card-competencias'

type Avaliacao = Prisma.AvaliacaoGetPayload<{
  include: {
    aluno: true,
    criterios: true,
    tema: true,
  }
}>

export const description = 'A multiple bar chart'

const chartConfig = {
  media: {
    label: 'Média',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

export function RelatorioEvolucao({ alunoId }: { alunoId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [avaliacoes, setAvaliaçoes] = useState<Avaliacao[]>([]);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [carregamento, setCarregamento] = useState(false);

  console.log(isOpen)

  useEffect(() => {
    const carregarAvaliacoes = async () => {
      if (!isOpen) return

      setCarregamento(true)
      try {
        const [novasAvaliacoes, novosCriterios] = await Promise.all([
          ListarAvaliacoesAlunoId(alunoId),
          ListarCriterios()
        ]);
        setAvaliaçoes(novasAvaliacoes);
        setCriterios(novosCriterios);
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
      } finally {
        setCarregamento(false)
      }
    };

    carregarAvaliacoes();
  }, [isOpen])

  function calcularMediasPorCriterio(
    avaliacoes: Awaited<ReturnType<typeof ListarAvaliacoesAlunoId>>,
    criterios: Criterio[]
  ) {
    const scoresByCriterio = avaliacoes
      .flatMap(a => a.criterios)
      .reduce((acc, c) => {
        acc[c.criterioId] = [...(acc[c.criterioId] || []), c.pontuacao];
        return acc;
      }, {} as Record<number, number[]>);

    return criterios.map(criterio => {
      const scores = scoresByCriterio[criterio.id];
      const media = (scores && scores.length > 0)
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;
      return { criterioId: criterio.id, media };
    });
  }

  function calcularMediaMensal(avaliacoes: Avaliacao[]) {
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

  const mediasPorCriterio = calcularMediasPorCriterio(avaliacoes, criterios);
  const chartData = calcularMediaMensal(avaliacoes);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size='icon' >
          <ChartNoAxesCombined />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] overflow-y-auto max-h-[95vh] gap-5">
        <DialogHeader>
          <DialogTitle className='text-center'>Relatório</DialogTitle>
        </DialogHeader>
        <div className='space-y-2'>
          <Label>
            Desempenho
          </Label>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="media" fill="var(--color-media)" radius={4} />
            </BarChart>
          </ChartContainer>
          <DialogDescription className="leading-none text-muted-foreground text-xs">
            Mostrando a evolução das médias nos últimos 11 meses
          </DialogDescription>
        </div>

        <div className='space-y-2'>
          <Label>
            Habilidades
          </Label>
          <div className='space-y-4 h-full overflow-y-auto pb-14 min-[1025px]:pb-0 scrollbar-thin scrollbar-thumb-card scrollbar-track-background'>
            {mediasPorCriterio.map((criterio, i) => (
              <CardCompetencia key={i} criterio={criterio} criterios={criterios} />
            ))}
          </div>
        </div>
        <DialogFooter className="text-xs sm:justify-start">

        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
