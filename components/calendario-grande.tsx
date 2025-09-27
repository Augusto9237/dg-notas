"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SlotHorario, StatusMentoria, StatusHorario } from "@/app/generated/prisma"
import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

type Mentoria = {
  id: number
  status: StatusMentoria
  alunoId: string
  horarioId: number
  duracao: number
  createdAt: Date
  updatedAt: Date
  horario: {
    data: Date
    slot: SlotHorario
    id: number
    status: StatusHorario
  }
  aluno: {
    image: string | null
    id: string
    name: string
    role: string | null
    createdAt: Date
    updatedAt: Date
    email: string
    emailVerified: boolean
    banned: boolean | null
    banReason: string | null
    banExpires: Date | null
  }
}

interface CalendarioGrandeProps {
  mentorias: Mentoria[]
}

interface TimeSlot {
  slot: SlotHorario
  display: string
  time: string
  startMinutes: number
}

const TIME_SLOTS: TimeSlot[] = [
  { slot: SlotHorario.SLOT_15_00, display: "15:00 - 15:20", time: "15:00", startMinutes: 15 * 60 },
  { slot: SlotHorario.SLOT_15_20, display: "15:20 - 15:40", time: "15:20", startMinutes: 15 * 60 + 20 },
  { slot: SlotHorario.SLOT_15_40, display: "15:40 - 16:00", time: "15:40", startMinutes: 15 * 60 + 40 },
  { slot: SlotHorario.SLOT_16_00, display: "16:00 - 16:20", time: "16:00", startMinutes: 16 * 60 },
  { slot: SlotHorario.SLOT_16_20, display: "16:20 - 16:40", time: "16:20", startMinutes: 16 * 60 + 20 },
  { slot: SlotHorario.SLOT_16_40, display: "16:40 - 17:00", time: "16:40", startMinutes: 16 * 60 + 40 }
]

const STATUS_COLORS = {
  AGENDADA: "bg-secondary",
  REALIZADA: "bg-primary",
  EM_ANDAMENTO: "bg-green-500",
  CONCLUIDA: "bg-gray-500",
  CANCELADA: "bg-red-500",
  FALTOU: "bg-orange-500",
} as const

const STATUS_LABELS = {
  AGENDADA: "Agendada",
  REALIZADA: "Realizada",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
  FALTOU: "Faltou",
} as const

enum Status {
  AGENDADA = "AGENDADA",
  CONCLUIDA = "REALIZADA",
  TODAS = 'TODAS'
}

const statusData: { label: string, value: Status }[] = [
  { label: "Agendada", value: Status.AGENDADA },
  { label: "Realizada", value: Status.CONCLUIDA },
  { label: "Todas", value: Status.TODAS },
];

// Função utilitária para obter a semana atual (começando no domingo)
const getCurrentWeekStart = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const day = today.getDay()

  let mondayOffset: number
  if (day === 0) {
    mondayOffset = 1 // Domingo: segunda é amanhã
  } else {
    mondayOffset = -(day - 1) // Volta para a segunda desta semana
  }

  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)

  return monday
}

export function CalendarioGrande({ mentorias }: CalendarioGrandeProps) {
  // Inicializa sempre com a semana atual
  const [statusSelecionado, setStatusSelecionado] = useState<Status | string>('')
  const [currentWeek, setCurrentWeek] = useState(() => getCurrentWeekStart());
  const [listaMentorias, setListaMentorias] = useState<Mentoria[]>([]);

  // Efeito para resetar para semana atual quando mentorias mudam
  useEffect(() => {
    setCurrentWeek(getCurrentWeekStart())
  }, [mentorias])

  // Aplicar filtro de status sempre que mentoriasOriginais ou statusSelecionado mudar
  useEffect(() => {
    let mentoriasFiltradas = mentorias;

    if (statusSelecionado !== '' && statusSelecionado !== Status.TODAS) {
      mentoriasFiltradas = mentorias.filter(
        (mentoria) => mentoria.status === statusSelecionado
      );
    }

    setListaMentorias(mentoriasFiltradas);
  }, [mentorias, statusSelecionado]);

  const getWeekDates = (date: Date) => {
    const week = new Date(date)
    const day = week.getDay()

    // Para semana começando no domingo, calcular segunda-feira
    let mondayOffset: number
    if (day === 0) {
      mondayOffset = 1 // Domingo: segunda é amanhã
    } else {
      mondayOffset = -(day - 1) // Volta para segunda desta semana
    }

    const monday = new Date(week)
    monday.setDate(week.getDate() + mondayOffset)

    const wednesday = new Date(monday)
    wednesday.setDate(monday.getDate() + 2)

    return { monday, wednesday }
  }

  const { monday, wednesday } = getWeekDates(currentWeek)

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek)
    const offset = direction === "next" ? 7 : -7
    newDate.setDate(currentWeek.getDate() + offset)
    setCurrentWeek(newDate)
  }

  // Função para voltar à semana atual
  const goToCurrentWeek = () => {
    setCurrentWeek(getCurrentWeekStart())
  }

  // Verifica se está na semana "atual" (mais relevante para hoje)
  const isCurrentWeek = useMemo(() => {
    const relevantWeekStart = getCurrentWeekStart()
    return currentWeek.getTime() === relevantWeekStart.getTime()
  }, [currentWeek])

  // Função para comparar datas UTC ignorando o horário e fuso horário
  const isSameDateUTC = (utcDateString: Date, targetDate: Date): boolean => {
    const utcDate = new Date(utcDateString)
    const utcYear = utcDate.getUTCFullYear()
    const utcMonth = utcDate.getUTCMonth()
    const utcDay = utcDate.getUTCDate()

    const targetYear = targetDate.getFullYear()
    const targetMonth = targetDate.getMonth()
    const targetDay = targetDate.getDate()

    return utcYear === targetYear && utcMonth === targetMonth && utcDay === targetDay
  }

  const getWeekMentorias = useMemo(() => {
    const filtered = listaMentorias.filter(mentoria => {
      return isSameDateUTC(mentoria.horario.data, monday) ||
        isSameDateUTC(mentoria.horario.data, wednesday)
    })

    return filtered
  }, [listaMentorias, monday, wednesday])

  const getMentoriasForDayAndSlot = (targetDate: Date, slot: SlotHorario): Mentoria[] => {
    return getWeekMentorias.filter(mentoria => {
      return isSameDateUTC(mentoria.horario.data, targetDate) && mentoria.horario.slot === slot
    })
  }

  function onChangeStatus(value: Status | string) {
    setStatusSelecionado(value);
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
    })
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric"
    })
  }


  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const MentoriaCard = ({ mentoria }: { mentoria: Mentoria }) => (
    <div
      className={cn(
        "rounded-md p-4 max-md:p-2 text-card flex items-center w-full text-xs font-medium shadow-sm cursor-pointer hover:opacity-90 transition-opacity overflow-hidden",
        STATUS_COLORS[mentoria.status as keyof typeof STATUS_COLORS],
      )}
      title={`${mentoria.aluno.name} - ${STATUS_LABELS[mentoria.status as keyof typeof STATUS_LABELS]}`}
    >
      <div className="flex items-center gap-2 w-full">
        <Avatar className="w-10 max-md:w-8 h-10 max-md:h-8 flex-shrink-0">
          <AvatarImage
            src={mentoria.aluno.image || undefined}
            alt={mentoria.aluno.name}
            className="object-cover"
          />
          <AvatarFallback className="text-xs">
            {getInitials(mentoria.aluno.name)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1 min-w-0 flex-1">
          <span className="font-semibold truncate text-ellipsis text-sm block">
            {mentoria.aluno.name}
          </span>
          <div>
            <p className="truncate text-xs max-md:leading-none opacity-80">
              {STATUS_LABELS[mentoria.status as keyof typeof STATUS_LABELS]}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const TimeSlotCell = ({
    targetDate,
    timeSlot,
    isLast,
    isMonday
  }: {
    targetDate: Date
    timeSlot: TimeSlot
    isLast: boolean
    isMonday: boolean
  }) => {
    const mentorias = getMentoriasForDayAndSlot(targetDate, timeSlot.slot)

    return (
      <div
        className={cn(
          "h-44 p-2 bg-background hover:bg-muted/20 transition-colors",
          "grid grid-cols-2 grid-rows-2 max-md:grid-cols-2 gap-2",
          "overflow-hidden",
          isMonday && "border-r border-border",
          !isLast && "border-b"
        )}
      >
        {mentorias.length === 0 && (
          <div className="col-span-full flex items-center justify-center text-muted-foreground text-xs">
            Livre
          </div>
        )}
        {mentorias.map((mentoria) => (
          <MentoriaCard mentoria={mentoria} key={mentoria.id} />
        ))}
      </div>
    )
  }

  const hasEvents = getWeekMentorias.length > 0

  return (
    <Card className="flex flex-col p-5 gap-4 h-full flex-1">
      <CardHeader className="flex items-center justify-between space-y-0 p-0">
        {/* Botão para voltar à semana atual */}

        <Button
          variant='outline'
          onClick={goToCurrentWeek}
          className="text-xs"
          disabled={isCurrentWeek}
        >
          Semana Atual
        </Button>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateWeek("prev")}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <CardTitle className="capitalize text-lg">
            {formatMonthYear(monday)}
          </CardTitle>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateWeek("next")}
            aria-label="Próxima semana"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Select value={statusSelecionado} onValueChange={onChangeStatus}>
          <SelectTrigger className="w-full md:min-w-fit max-w-[200px] max-md:max-w-[120px]">
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
      </CardHeader>

      <CardContent className="h-full flex-1 overflow-hidden p-0 pb-22">
        {/* Grade do calendário */}
        <div className="grid grid-cols-[80px_1fr_1fr] max-md:grid-cols-[60px_1fr_1fr] gap-0 border border-border rounded-t-lg md:pr-3.5 bg-background/30 ">
          {/* Cabeçalho da coluna de horários */}
          <div className="border-r border-border p-4 px-2 text-center">
            <div className="text-sm max-md:text-xs font-medium text-muted-foreground">
              Horário
            </div>
          </div>


          {/* Cabeçalhos dos dias */}
          <div className="border-r border-border p-4 text-center">
            <div className="text-sm max-md:text-xs font-medium text-muted-foreground">
              Segunda-feira
            </div>
            <div className="text-xl max-md:text-lg font-bold">
              {formatDate(monday)}
            </div>
          </div>

          <div className="p-4 text-center">
            <div className="text-sm max-md:text-xs font-medium text-muted-foreground">
              Quarta-feira
            </div>
            <div className="text-xl max-md:text-lg font-bold">
              {formatDate(wednesday)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[80px_1fr_1fr] max-md:grid-cols-[60px_1fr_1fr] gap-0 border border-border border-t-0 rounded-b-lg overflow-x-hidden overflow-y-scroll h-full flex-1">

          {/* Slots de tempo e eventos */}
          {TIME_SLOTS.map((timeSlot, index) => {
            const isLast = index === TIME_SLOTS.length - 1

            return (
              <React.Fragment key={timeSlot.slot}>
                {/* Label do horário */}
                <div
                  className={cn(
                    "border-r border-border p-2 text-sm max-md:text-xs text-muted-foreground bg-background/10 text-center flex flex-col justify-center",
                    !isLast && "border-b"
                  )}
                >
                  <div className="font-medium">{timeSlot.time}</div>
                </div>

                {/* Células dos dias */}
                <TimeSlotCell
                  targetDate={monday}
                  timeSlot={timeSlot}
                  isLast={isLast}
                  isMonday={true}
                />
                <TimeSlotCell
                  targetDate={wednesday}
                  timeSlot={timeSlot}
                  isLast={isLast}
                  isMonday={false}
                />
              </React.Fragment>
            )
          })}
        </div>
      </CardContent>

      <CardFooter >
        <CardDescription className="text-center w-full">
          {getWeekMentorias.length > 0 ? (
            `${getWeekMentorias.length} mentoria${getWeekMentorias.length !== 1 ? 's' : ''} esta semana`
          ) : (
            'Nenhuma mentoria esta semana'
          )}
        </CardDescription>
      </CardFooter>
    </Card >
  )
}