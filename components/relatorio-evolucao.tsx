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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Avaliacao = Prisma.AvaliacaoGetPayload<{
  include: {
    aluno: true,
    criterios: true,
    tema: true,
  }
}>

type Aluno = {
  id: string;
  nome: string;
  email: string;
  image: string;
  telefone: string;
  criado: Date;
}

interface RelatorioProps {
  aluno: Aluno
  avaliacoes: Avaliacao[]
  criterios: Criterio[]
}


const chartConfig = {
  media: {
    label: 'Média',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

export function RelatorioEvolucao({ aluno, avaliacoes, criterios }: RelatorioProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [listaAvaliacoes, setListaAvaliaçoes] = useState<Avaliacao[]>([]);
  const [listaCriterios, setListaCriterios] = useState<Criterio[]>([]);
  const [carregamento, setCarregamento] = useState(false);


  useEffect(() => {
    const carregarAvaliacoes = () => {
      setCarregamento(true)
      try {

        setListaAvaliaçoes(avaliacoes);
        setListaCriterios(criterios);
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
      } finally {
        setCarregamento(false)
      }
    };

    carregarAvaliacoes();
  }, [avaliacoes, criterios])

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

  const mediasPorCriterio = calcularMediasPorCriterio(listaAvaliacoes, listaCriterios);
  const chartData = calcularMediaMensal(listaAvaliacoes);

  function formartarData(data: Date) {
    // Converter a data UTC para uma data local sem problemas de fuso horário
    const dataUTC = new Date(data);
    const dataLocal = new Date(
      dataUTC.getUTCFullYear(),
      dataUTC.getUTCMonth(),
      dataUTC.getUTCDate()
    );
    return format(dataLocal, "dd/MM/yyyy", { locale: ptBR });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ChartNoAxesCombined />
          Relatorio
        </Button>
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
          <div className='space-y-5'>
            <div className='space-y-2'>
              <Label>
                Nome: <p className='font-light'>{aluno.nome}</p>
              </Label>
              <Label>
                E-mail: <p className='font-light'>{aluno.email}</p>
              </Label>
              <Label>
                Telefone: <p className='font-light'>{aluno.telefone}</p>
              </Label>
              <Label>
                Desde: <p className='font-light'>{formartarData(aluno.criado)}</p>
              </Label>
            </div>

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
          </div>
        )
        }
        <DialogFooter className="text-xs sm:justify-start">

        </DialogFooter>
      </DialogContent >
    </Dialog >
  )
}
