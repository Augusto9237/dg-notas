'use client'

import { ChartNoAxesCombined } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts'
import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'

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
import { useEffect, useRef, useState, useTransition } from 'react'

import { Criterio, Prisma } from '@/app/generated/prisma'
import { ListarAvaliacoesAlunoId } from '@/actions/avaliacao'
import { CardCompetencia } from './card-competencias'
import { Spinner } from './ui/spinner'
import { calcularMediaMensal } from '@/lib/media-geral'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { calcularMedia } from '@/lib/media-geral';
import { Separator } from './ui/separator'
import { toast } from 'sonner'

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
  const [isPending, startTransition] = useTransition()
  const relatorioRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const carregarAvaliacoes = async () => {
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
  }, [aluno.id, avaliacoes,criterios])

  function calcularMediasPorCriterio(
    avaliacoes: Avaliacao[],
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

  const gerarPdf = () => {
    startTransition(async () => {
      const element = relatorioRef.current
      if (!element) {
        console.error('Elemento não encontrado')
        return
      }

      // Captura classes do body para garantir contexto de tema
      const bodyClasses = document.body.className

      try {
        // Aguarda animações do Dialog terminarem
        await new Promise((r) => setTimeout(r, 300))

        // Função auxiliar para converter cores LAB para RGB
        const convertAllColorsToRGB = (element: HTMLElement) => {
          const allElements = [element, ...Array.from(element.querySelectorAll('*'))]
          const colorProps = [
            'color', 'backgroundColor', 'background',
            'borderColor', 'borderTopColor', 'borderRightColor',
            'borderBottomColor', 'borderLeftColor',
            'border', 'outlineColor', 'outline',
            'textDecorationColor', 'fill', 'stroke'
          ]

          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement
            const computedStyle = window.getComputedStyle(htmlEl)
            colorProps.forEach(prop => {
              const value = computedStyle.getPropertyValue(prop)
              if (value && value.trim() && value !== 'none' && value !== 'transparent') {
                htmlEl.style.setProperty(prop, value, 'important')
              }
            })
          })
        }

        // --- PÁGINA 1 ---
        // Clona o elemento original
        const clone1 = element.cloneNode(true) as HTMLElement
        clone1.className = element.className + ' ' + bodyClasses // Herda classes
        // Configura estilos básicos para renderização off-screen
        clone1.style.width = `${element.offsetWidth}px`
        clone1.style.height = 'auto'
        clone1.style.position = 'fixed' // Trocado para fixed
        clone1.style.left = '0'
        clone1.style.top = '0'
        clone1.style.zIndex = '-9999'
        clone1.style.background = '#ffffff'
        clone1.style.color = '#000000'
        clone1.style.opacity = '1' // IMPORTANTE: Opacidade 1 para garantir renderização

        // Manipula o Clone 1: Manter Cabeçalho + Gráfico + 2 Cards
        const skillsContainer1 = clone1.querySelectorAll('.space-y-4')[1]?.querySelector('.space-y-4')
        if (skillsContainer1) {
          const cards1 = Array.from(skillsContainer1.children)
          // Remove cards a partir do índice 2 (3º, 4º, 5º)
          cards1.slice(2).forEach(card => card.remove())
        }

        // Remove o rodapé (Separador e Média Final) da página 1
        const separator1 = clone1.querySelector('[role="separator"]') || clone1.querySelector('.shrink-0.bg-border')
        if (separator1) separator1.remove()

        const footer1 = clone1.lastElementChild
        if (footer1 && footer1.classList.contains('flex') && footer1.classList.contains('justify-between')) {
          footer1.remove()
        }

        document.body.appendChild(clone1)

        // Delay crítico para processamento de estilos e conversão
        await new Promise((r) => setTimeout(r, 500))
        convertAllColorsToRGB(clone1)
        await new Promise((r) => setTimeout(r, 500))

        // Renderiza Página 1
        const dataUrl1 = await toPng(clone1, {
          quality: 1,
          pixelRatio: 5, // Alta qualidade
          backgroundColor: '#ffffff',
        })
        document.body.removeChild(clone1)


        // --- PÁGINA 2 ---
        const clone2 = element.cloneNode(true) as HTMLElement
        clone2.className = element.className + ' ' + bodyClasses
        clone2.style.width = `${element.offsetWidth}px`
        clone2.style.height = 'auto'
        clone2.style.position = 'fixed'
        clone2.style.left = '0'
        clone2.style.top = '0'
        clone2.style.zIndex = '-9999'
        clone2.style.background = '#ffffff'
        clone2.style.color = '#000000'
        clone2.style.opacity = '1'
        clone2.style.paddingTop = '20px'

        // Manipula DOM Page 2 (3 Cards + Footer)
        // Remove Info Aluno (primeiro space-y-2)
        const relatorio = clone2.querySelector('.pt-5')
        if (relatorio) relatorio.remove()
        const infoAluno = clone2.querySelector('.space-y-2')
        if (infoAluno) infoAluno.remove()

        // Remove Titulo "Desempenho" e Gráfico (primeiro space-y-4)
        const graphContainer = clone2.querySelector('.space-y-4')
        if (graphContainer) graphContainer.remove()

        // Ajusta container de Habilidades
        const skillsSection2 = clone2.querySelector('.space-y-4') // Agora é o primeiro space-y-4 pois removemos o anterior
        if (skillsSection2) {
          // Remove label "Habilidades" se quiser limpar mais, ou mantem. 
          const labelHabilidades = skillsSection2.querySelector('label')
          if (labelHabilidades) labelHabilidades.remove()
          // O card container é o filho .space-y-4 dentro dele
          const cardsContainer2 = skillsSection2.querySelector('.space-y-4')
          if (cardsContainer2) {
            const cards2 = Array.from(cardsContainer2.children)
            // Remove os 2 primeiros cards
            cards2.slice(0, 2).forEach(card => card.remove())
          }
        }

        document.body.appendChild(clone2)

        // Converte cores para o Clone 2
        await new Promise((r) => setTimeout(r, 500))
        convertAllColorsToRGB(clone2)
        await new Promise((r) => setTimeout(r, 500))

        // Renderiza Página 2
        const dataUrl2 = await toPng(clone2, {
          quality: 1,
          pixelRatio: 5,
          backgroundColor: '#ffffff',
        })
        document.body.removeChild(clone2)


        // --- MONTAGEM DO PDF ---
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const paddingX = 5
        const paddingTop = 5
        const contentWidth = pdfWidth - (paddingX * 2)

        // Adiciona Página 1
        const img1 = new Image()
        img1.src = dataUrl1
        await new Promise(resolve => { img1.onload = resolve })

        const imgHeight1 = (img1.height * contentWidth) / img1.width
        pdf.addImage(dataUrl1, 'PNG', paddingX, paddingTop, contentWidth, imgHeight1)

        // Adiciona Página 2
        pdf.addPage()
        const img2 = new Image()
        img2.src = dataUrl2
        await new Promise(resolve => { img2.onload = resolve })

        const imgHeight2 = (img2.height * contentWidth) / img2.width
        pdf.addImage(dataUrl2, 'PNG', paddingX, paddingTop, contentWidth, imgHeight2)

        pdf.save(`relatorio-${aluno.nome.toLowerCase().replace(/ /g, '-')}.pdf`)
        toast.success('Relatório gerado com sucesso!')
      } catch (error) {
        console.error('Erro ao gerar PDF:', error)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ChartNoAxesCombined />
          Relatorio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] overflow-y-auto max-h-[95vh] gap-0 p-0" >
        {carregamento ? (
          <div className='w-full h-full flex items-center justify-center'>
            <Spinner className='size-10' />
          </div>
        ) : (
          <div className="space-y-5 px-5" ref={relatorioRef}>
            <DialogHeader className='pt-5'>
              <DialogTitle className='text-center'>Relatório</DialogTitle>
            </DialogHeader>
            <div className='space-y-2'>
              <Label>
                Nome: <p className='font-light text-xs'>{aluno.nome}</p>
              </Label>
              <Label>
                E-mail: <p className='font-light text-xs'>{aluno.email}</p>
              </Label>
              <Label>
                Telefone: <p className='font-light text-xs'>{aluno.telefone}</p>
              </Label>
              <Label>
                Desde: <p className='font-light text-xs'>{formartarData(aluno.criado)}</p>
              </Label>
            </div>

            <div className='space-y-4'>
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

                  <Bar dataKey="media" fill="var(--color-media)" radius={4} >
                    <LabelList
                      position="top"
                      offset={10}
                      className="fill-foreground text-xs"
                      dataKey={"media"}
                      formatter={(value: number) => value.toFixed(2)}
                    />
                  </Bar>
                </BarChart>

              </ChartContainer>

            </div>

            <div className='space-y-4'>
              <Label>
                Habilidades
              </Label>
              <div className='space-y-4 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-card scrollbar-track-background'>
                {mediasPorCriterio.map((criterio, i) => (
                  <CardCompetencia key={i} criterio={criterio} criterios={criterios} />
                ))}
              </div>
            </div>

            <Separator />

            <div className='flex justify-between items-center'>
              <Label className='font-semibold'>
                Média final
              </Label>
              <Label className='font-semibold'>{calcularMedia(listaAvaliacoes).toFixed(2)}</Label>
            </div>
          </div>
        )}
        <DialogFooter className="w-full grid grid-cols-2 gap-4 p-5">
          <DialogClose asChild disabled={isPending}>
            <Button variant='ghost'>Cancelar</Button>
          </DialogClose>
          <Button onClick={gerarPdf} type='button' disabled={isPending}>
            {isPending ? 'Gerando PDF...' : 'Gerar PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}