'use client'

import { ChartNoAxesCombined, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'


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

import { Criterio, Prisma } from '@/app/generated/prisma'
import { ListarAvaliacoesAlunoId, ListarCriterios } from '@/actions/avaliacao'
import { CardCompetencia } from './card-competencias'
import { Spinner } from './ui/spinner'
import { calcularMediaMensal } from '@/lib/media-geral'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

type Avaliacao = Prisma.AvaliacaoGetPayload<{
  include: {
    aluno: true,
    criterios: true,
    tema: true,
  }
}>


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

  const mediasPorCriterio = calcularMediasPorCriterio(avaliacoes, criterios);
  const chartData = calcularMediaMensal(avaliacoes);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger>
            <Button variant="outline" size='icon' onClick={() => setIsOpen(true)} >
              <ChartNoAxesCombined />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-primary dark:text-accent-foreground bg-card fill-card">
            <p>Relatorio</p>
          </TooltipContent>
        </Tooltip>
      </DialogTrigger >
      <DialogContent className="sm:max-w-[625px] overflow-y-auto max-h-[95vh] gap-5">
        <DialogHeader>
          <DialogTitle className='text-center'>Relatório</DialogTitle>
        </DialogHeader>
        {carregamento === true ? (
          <div className='w-full h-full flex items-center justify-center'>
            <Spinner className='size-10' />
          </div>
        ) : (
          <>
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
              <div className='space-y-4 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-card scrollbar-track-background'>
                {mediasPorCriterio.map((criterio, i) => (
                  <CardCompetencia key={i} criterio={criterio} criterios={criterios} />
                ))}
              </div>
            </div>
          </>)
        }
        <DialogFooter className="text-xs sm:justify-start">

        </DialogFooter>
      </DialogContent >
    </Dialog >
  )
}
