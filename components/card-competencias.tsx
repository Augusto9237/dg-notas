'use client'
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card"
import {
    Label,
    PolarAngleAxis,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from "recharts"

import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Criterio } from "@/app/generated/prisma"

const chartConfig = {
    value: {
        label: "Value",
    },
    ruim: {
        label: "ruim",
        color: "var(--red-500)",
    },
    regular: {
        label: "regular",
        color: "var(--secondary-foreground)",
    },
    bom: {
        label: "bom",
        color: "var(--secondary)",
    },
    muitoBom: {
        label: "muito bom",
        color: "var(--primary-foreground)",
    },
    excelente: {
        label: "excelente",
        color: "var(--primary)",
    }
} satisfies ChartConfig

interface CardCompetenciaProps {
    criterio: {
        criterioId: number;
        media: number;
    }
    criterios: Criterio[]
}

export function CardCompetencia({ criterio, criterios }: CardCompetenciaProps) {
    const criterioInfo = criterios.find(c => c.id === criterio.criterioId);

    const media = Math.min(criterio.media, 200);

    const getFillColor = (value: number) => {
        if (value >= 160) return chartConfig.excelente.color;
        if (value >= 120) return chartConfig.muitoBom.color;
        if (value >= 80) return chartConfig.bom.color;
        if (value >= 40) return chartConfig.regular.color;
        return chartConfig.ruim.color;
    }

    const fillColor = getFillColor(media);
    const chartData = [{ name: 'media', value: media, fill: fillColor }];

    return (
        <Card
            className="hover:shadow-md transition-shadow p-0 min-h-[124px] h-full max-h-[124px] w-full gap-0 relative"
        >
            <CardContent className="p-4 relative h-full flex w-full overflow-hidden">
                <div className="w-[154px] h-[122px] -ml-8 -mt-4">
                    <ChartContainer
                        config={chartConfig}
                        className="w-full h-full p-0"
                    >
                        <RadialBarChart
                            data={chartData}
                            startAngle={-360}
                            endAngle={0}
                            innerRadius="70%"
                            outerRadius="100%"
                            barSize={24}
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, 200]}
                                tick={false}
                                angleAxisId={0}
                            />
                            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} />
                            <RadialBar
                                dataKey="value"
                                background={{ fill: '(var(--card))' }}
                                cornerRadius={5}
                                angleAxisId={0}
                            />
                            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy! + 5}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy! - 1}
                                                        className={"text-xl font-bold"}
                                                        style={{ fill: fillColor }}
                                                    >
                                                        {media.toFixed(0)}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 15}
                                                        className="fill-muted-foreground text-xs"
                                                    >
                                                        200
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </PolarRadiusAxis>
                        </RadialBarChart>
                    </ChartContainer>
                </div>

                <div className="space-y-1 w-full h-full -ml-4">
                    <CardTitle className="text-sm">
                        {criterioInfo?.nome}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {criterioInfo?.descricao}
                    </CardDescription>
                </div>
            </CardContent>
        </Card>
    )
}
