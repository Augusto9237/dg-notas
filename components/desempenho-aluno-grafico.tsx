'use client'

import { Prisma } from "@/app/generated/prisma"
import { Label } from "./ui/label"
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart'
import { useContext, useEffect, useState } from "react"
import { ContextoAluno } from "@/context/contexto-aluno"


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

export function DesempenhoAlunoGrafico() {
    const { listaAvaliacoes } = useContext(ContextoAluno);
    const [carregamento, setCarregamento] = useState(false);

    useEffect(() => {
        setCarregamento(true)
    }, [])

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

    const chartData = carregamento ? calcularMediaMensal(listaAvaliacoes) : []

    return (
        <div className='h-full flex flex-col overflow-hidden p-5 pb-6 max-sm:pb-14'>
            <h2 className="mb-3 text-primary font-semibold">Desempenho</h2>
            <ChartContainer config={chartConfig} className="flex-1 mb-2 max-sm:mb-1">
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
            <p className="leading-none text-muted-foreground text-xs">
                Média de desempenho mensais
            </p>
        </div>
    )
}