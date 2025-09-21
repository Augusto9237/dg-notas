'use client'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { useEffect, useState } from "react"
import { AgendarMentoriaModal } from "./agendar-mentoria-modal"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "./ui/calendar"
import { CardMentoria } from "./card-mentoria"
import { Prisma } from "@/app/generated/prisma"
import { listarMentoriasHorario } from "@/actions/mentoria"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        horario: true;
        aluno: true;
    };
}>;

interface ListaMentoriasProps {
    mentoriasIniciais: Mentoria[]
}

enum Status {
    AGENDADA = "AGENDADA",
    CONCLUIDA = "REALIZADA"
}

const statusData: { label: string, value: Status }[] = [
    { label: "Agendada", value: Status.AGENDADA },
    { label: "Realizada", value: Status.CONCLUIDA }
];

export function ListaMentorias({ mentoriasIniciais }: ListaMentoriasProps) {
    const router = useRouter() // Adicione o router
    const [open, setOpen] = useState(false)
    const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined)
    
    // Estados separados para dados originais e filtrados
    const [mentoriasOriginais, setMentoriasOriginais] = useState<Mentoria[]>([]);
    const [mentorias, setMentorias] = useState<Mentoria[]>([]);
    const [statusSelecionado, setStatusSelecionado] = useState<Status | string>('')

    // Inicializar com os dados iniciais
    useEffect(() => {
        setMentoriasOriginais(mentoriasIniciais)
        setMentorias(mentoriasIniciais)
    }, [mentoriasIniciais])

    // Buscar mentorias por data
    useEffect(() => {
        async function FiltrarPorData() {
            const mentoriasData = await listarMentoriasHorario(dataSelecionada)
            setMentoriasOriginais(mentoriasData)
        }
        
        if (dataSelecionada) {
            FiltrarPorData()
        } else {
            // Se não há data selecionada, volta para as mentorias iniciais
            setMentoriasOriginais(mentoriasIniciais)
        }
    }, [dataSelecionada, mentoriasIniciais])

    // Aplicar filtro de status sempre que mentoriasOriginais ou statusSelecionado mudar
    useEffect(() => {
        let mentoriasFiltradas = mentoriasOriginais;

        if (statusSelecionado !== '') {
            mentoriasFiltradas = mentoriasOriginais.filter(
                (mentoria) => mentoria.status === statusSelecionado
            );
        }

        setMentorias(mentoriasFiltradas);
    }, [mentoriasOriginais, statusSelecionado]);

    function onChangeStatus(value: Status | string) {
        setStatusSelecionado(value);
    }

    // Função para limpar filtros
    function limparFiltros() {
        setDataSelecionada(undefined);
        setStatusSelecionado('');
    }

    return (
        <main className="flex flex-col p-5 gap-5">
            <div className="grid grid-cols-4 items-center gap-4 w-full">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="date-picker"
                            className="w-full"
                        >
                            <CalendarIcon />
                            <span>
                                {dataSelecionada !== undefined 
                                    ? `${format(new Date(dataSelecionada), "dd/MM/yyyy")}` 
                                    : 'Selecionar Data'
                                }
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-sm overflow-hidden p-0"
                        align="center"
                        alignOffset={-8}
                        sideOffset={10}
                    >
                        <Calendar
                            mode="single"
                            selected={dataSelecionada}
                            onSelect={setDataSelecionada}
                            locale={ptBR}
                            disabled={(date) => {
                                // Disable dates in the past
                                if (date < new Date()) return true

                                // Get day of week (0 = Sunday, 1 = Monday, etc)
                                const dayOfWeek = date.getDay()

                                // Only enable Tuesdays (2) and Thursdays (4)
                                return dayOfWeek !== 1 && dayOfWeek !== 3
                            }}
                            className="rounded-md border w-sm"
                        />
                    </PopoverContent>
                </Popover>

                <Select onValueChange={onChangeStatus} value={statusSelecionado}>
                    <SelectTrigger className="w-full md:min-w-[180px]">
                        <SelectValue placeholder="Filtrar por Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusData.map((status, i) => (
                            <SelectItem key={i} value={status.value}>
                                {status.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Botão para limpar filtros */}
                {(dataSelecionada || statusSelecionado !== '') && (
                    <Button 
                        variant='ghost'
                        onClick={limparFiltros}
                        className="whitespace-nowrap justify-start"
                    >
                        Limpar Filtros
                    </Button>
                )}
            </div>
            
            <div className="grid grid-cols-4 max-md:grid-cols-1 gap-4">
                {mentorias.length === 0 ? (
                    <Card className="col-span-4 bg-background border-none shadow-none">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            {dataSelecionada || statusSelecionado !== '' 
                                ? 'Nenhuma mentoria encontrada para os filtros aplicados'
                                : 'Nenhuma mentoria agendada'
                            }
                        </CardContent>
                    </Card>
                ) : (
                    mentorias.map((mentoria) => (
                        <CardMentoria 
                            key={mentoria.id} 
                            mentoria={mentoria} 
                            professor={true} 
                            aluno={mentoria.aluno} 
                        />
                    ))
                )}
            </div>
        </main>
    )
}