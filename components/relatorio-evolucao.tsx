'use client'

import { ChartNoAxesCombined } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'

import { Button } from "@/components/ui/button"
import {
  Dialog,
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
import { useEffect, useRef, useState } from 'react'

import { Criterio, Prisma } from '@/app/generated/prisma'
import { ListarAvaliacoesAlunoId } from '@/actions/avaliacao'
import { CardCompetencia } from './card-competencias'
import { Spinner } from './ui/spinner'
import { calcularMediaMensal } from '@/lib/media-geral'
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
  const [isOpen, setIsOpen] = useState(false)
  const [listaAvaliacoes, setListaAvaliaçoes] = useState<Avaliacao[]>([])
  const [listaCriterios, setListaCriterios] = useState<Criterio[]>([])
  const [carregamento, setCarregamento] = useState(false)
  const [gerandoPdf, setGerandoPdf] = useState(false)
  const relatorioRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const carregarAvaliacoes = () => {
      setCarregamento(true)
      try {
        setListaAvaliaçoes(avaliacoes)
        setListaCriterios(criterios)
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error)
      } finally {
        setCarregamento(false)
      }
    }

    carregarAvaliacoes()
  }, [avaliacoes, criterios])

  function calcularMediasPorCriterio(
    avaliacoes: Awaited<ReturnType<typeof ListarAvaliacoesAlunoId>>,
    criterios: Criterio[]
  ) {
    const scoresByCriterio = avaliacoes
      .flatMap(a => a.criterios)
      .reduce((acc, c) => {
        acc[c.criterioId] = [...(acc[c.criterioId] || []), c.pontuacao]
        return acc
      }, {} as Record<number, number[]>)

    return criterios.map(criterio => {
      const scores = scoresByCriterio[criterio.id]
      const media = (scores && scores.length > 0)
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0
      return { criterioId: criterio.id, media }
    })
  }

  const mediasPorCriterio = calcularMediasPorCriterio(listaAvaliacoes, listaCriterios)
  const chartData = calcularMediaMensal(listaAvaliacoes)

  function formartarData(data: Date) {
    const dataUTC = new Date(data)
    const dataLocal = new Date(
      dataUTC.getUTCFullYear(),
      dataUTC.getUTCMonth(),
      dataUTC.getUTCDate()
    )
    return format(dataLocal, "dd/MM/yyyy", { locale: ptBR })
  }

  const gerarPdf = async () => {
    const element = relatorioRef.current
    if (!element) {
      console.error('Elemento não encontrado')
      return
    }

    setGerandoPdf(true)

    try {
      // Aguarda animações do Dialog terminarem
      await new Promise((r) => setTimeout(r, 300))

      // Converte o elemento para PNG
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      })

      // Cria o PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const img = new Image()
      img.src = dataUrl

      img.onload = () => {
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (img.height * pdfWidth) / img.width

        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`relatorio-${aluno.nome.toLowerCase().replace(/ /g, '-')}.pdf`)
        setGerandoPdf(false)
      }

      img.onerror = () => {
        console.error('Erro ao carregar imagem')
        setGerandoPdf(false)
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      setGerandoPdf(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ChartNoAxesCombined />
          Relatorio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] overflow-y-auto max-h-[95vh] gap-5" ref={relatorioRef}>
        <DialogHeader>
          <DialogTitle className='text-center'>Relatório</DialogTitle>
        </DialogHeader>
        {carregamento ? (
          <div className='w-full h-full flex items-center justify-center'>
            <Spinner className='size-10' />
          </div>
        ) : (
          <div className="space-y-5">
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
        )}
        <DialogFooter className="text-xs sm:justify-start">
          <Button onClick={gerarPdf} type='button' disabled={gerandoPdf}>
            {gerandoPdf ? 'Gerando PDF...' : 'Gerar PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}