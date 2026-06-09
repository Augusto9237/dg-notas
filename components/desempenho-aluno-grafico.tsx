'use client'

import { Prisma } from "@/app/generated/prisma"
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart'
import { useContext, useEffect, useState } from "react"
import { ContextoAluno } from "@/context/contexto-aluno"
import { calcularMediaMensal } from "@/lib/media-geral"
import { atualizarCache } from "@/actions/cache"
import { Skeleton } from "./ui/skeleton"


type Avaliacao = Prisma.AvaliacaoGetPayload<{
    include: {
        aluno: true
        criterios: true
        tema: true
    }
}>

interface DesempenhoAlunoGraficoProps {
    avaliacoes: Avaliacao[]
    userId: string
}


const chartConfig = {
    media: {
        label: 'Média',
        color: 'var(--primary)',
    },
} satisfies ChartConfig

export function DesempenhoAlunoGraficoSkeleton() {
    return (
        <GraficoWrapper>
            <ChartContainer config={chartConfig} className="flex-1 mb-2 max-sm:mb-1">
                <Skeleton className="w-full h-24 rounded-lg" />
            </ChartContainer>
        </GraficoWrapper>
    )
}


export default function DesempenhoAlunoGrafico({ avaliacoes, userId }: DesempenhoAlunoGraficoProps) {
    const { notificacoes } = useContext(ContextoAluno)
    const [carregando, setCarregando] = useState(false)

    useEffect(() => {
        const urlNotificacao = notificacoes?.data?.url
        if (urlNotificacao !== '/aluno/avaliacoes') return

        const revalidar = async () => {
            setCarregando(true)
            try {
                await atualizarCache(`listar-avaliacoes-aluno-${userId}`)
            } catch (error) {
                console.error("Erro ao revalidar dados via notificação:", error)
            } finally {
                setCarregando(false)
            }
        }

        revalidar()
    }, [notificacoes, userId])

    const dadosGrafico = carregando ? [] : calcularMediaMensal(avaliacoes)

    return (
        <GraficoWrapper>
            <ChartContainer config={chartConfig} className="flex-1 mb-2 max-sm:mb-1">
                <BarChart accessibilityLayer data={dadosGrafico}>
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
            <p className="leading-none text-muted-foreground text-xs">
                Médias de desempenho mensais
            </p>
        </GraficoWrapper>
    )
}

function GraficoWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className='h-full flex flex-col overflow-hidden p-5 pb-6 max-sm:pb-14'>
            <h2 className="mb-3 text-primary font-semibold">Seu Desempenho</h2>
            {children}
        </div>
    )
}