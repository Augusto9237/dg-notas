"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Skeleton } from "./ui/skeleton"
import { CardMentoriaProfessor } from "./card-mentoria-professor"
import { cn } from "@/lib/utils"
import {
  SlotHorario,
  StatusMentoria,
  StatusHorario,
} from "@/app/generated/prisma"
import React from "react"

// Tipos e Constantes
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

const HORARIOS: TimeSlot[] = [
  {
    slot: SlotHorario.SLOT_15_00,
    display: "15:00 - 15:20",
    time: "15:00",
    startMinutes: 15 * 60,
  },
  {
    slot: SlotHorario.SLOT_15_20,
    display: "15:20 - 15:40",
    time: "15:20",
    startMinutes: 15 * 60 + 20,
  },
  {
    slot: SlotHorario.SLOT_15_40,
    display: "15:40 - 16:00",
    time: "15:40",
    startMinutes: 15 * 60 + 40,
  },
  {
    slot: SlotHorario.SLOT_16_00,
    display: "16:00 - 16:20",
    time: "16:00",
    startMinutes: 16 * 60,
  },
  {
    slot: SlotHorario.SLOT_16_20,
    display: "16:20 - 16:40",
    time: "16:20",
    startMinutes: 16 * 60 + 20,
  },
  {
    slot: SlotHorario.SLOT_16_40,
    display: "16:40 - 17:00",
    time: "16:40",
    startMinutes: 16 * 60 + 40,
  },
]

enum StatusFiltro {
  AGENDADA = "AGENDADA",
  CONCLUIDA = "REALIZADA",
  TODAS = "TODAS",
}

const DADOS_STATUS = [
  { label: "Agendada", value: StatusFiltro.AGENDADA },
  { label: "Realizada", value: StatusFiltro.CONCLUIDA },
  { label: "Todas", value: StatusFiltro.TODAS },
]

// Funções Utilitárias
const obterInicioSemanaAtual = () => {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const diaSemana = hoje.getDay()
  const offsetSegunda = diaSemana === 0 ? 1 : -(diaSemana - 1)
  const segunda = new Date(hoje)
  segunda.setDate(hoje.getDate() + offsetSegunda)
  return segunda
}

const formatarData = (data: Date) => {
  return data.toLocaleDateString("pt-BR", { day: "2-digit" })
}

const formatarMesAno = (data: Date) => {
  return data.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })
}

const saoMesmaDataUTC = (dataUTC: Date, dataLocal: Date): boolean => {
  const dataConvertida = new Date(dataUTC)
  return (
    dataConvertida.getUTCFullYear() === dataLocal.getFullYear() &&
    dataConvertida.getUTCMonth() === dataLocal.getMonth() &&
    dataConvertida.getUTCDate() === dataLocal.getDate()
  )
}

// Componente da Célula de Horário
interface CelulaHorarioProps {
  data: Date
  horario: TimeSlot
  eUltimo: boolean
  eSegunda: boolean
  mentorias: Mentoria[]
  carregando: boolean
  setListaMentorias: React.Dispatch<React.SetStateAction<Mentoria[]>>
}

const CelulaHorario = React.memo(
  ({
    data,
    horario,
    eUltimo,
    eSegunda,
    mentorias,
    carregando,
    setListaMentorias,
  }: CelulaHorarioProps) => {
    const mentoriasDoSlot = useMemo(
      () =>
        mentorias.filter(
          (m) =>
            saoMesmaDataUTC(m.horario.data, data) &&
            m.horario.slot === horario.slot
        ),
      [mentorias, data, horario.slot]
    )

    return (
      <div
        className={cn(
          "h-44 max-md:h-80 p-2 bg-card hover:bg-muted/20 transition-colors",
          "grid grid-cols-2 grid-rows-2 max-md:grid-cols-1 max-md:grid-rows-4 gap-2",
          "overflow-hidden",
          eSegunda && "border-r border-border",
          !eUltimo && "border-b"
        )}
      >
        {carregando ? (
          <Skeleton className="w-full h-full col-span-full row-span-full bg-background" />
        ) : (
          <>
            {mentoriasDoSlot.length === 0 && (
              <div className="col-span-full flex items-center justify-center text-muted-foreground text-xs">
                Livre
              </div>
            )}
            {mentoriasDoSlot.map((mentoria) => (
              <CardMentoriaProfessor
                mentoria={mentoria}
                setListaMentorias={setListaMentorias}
                key={mentoria.id}
              />
            ))}
          </>
        )}
      </div>
    )
  }
)
CelulaHorario.displayName = "CelulaHorario"

// Componente Principal
export function CalendarioGrande({ mentorias }: CalendarioGrandeProps) {
  const [statusSelecionado, setStatusSelecionado] =
    useState<StatusFiltro | string>(StatusFiltro.TODAS)
  const [semanaAtual, setSemanaAtual] = useState(obterInicioSemanaAtual)
  const [listaMentorias, setListaMentorias] = useState<Mentoria[]>(mentorias)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    setCarregando(true)
    const mentoriasFiltradas =
      statusSelecionado === StatusFiltro.TODAS
        ? mentorias
        : mentorias.filter((m) => m.status === statusSelecionado)
    setListaMentorias(mentoriasFiltradas)
    const timer = setTimeout(() => setCarregando(false), 300)
    return () => clearTimeout(timer)
  }, [mentorias, statusSelecionado])

  const { segunda, quarta } = useMemo(() => {
    const inicioSemana = new Date(semanaAtual)
    const segundaFeira = new Date(inicioSemana)
    const quartaFeira = new Date(inicioSemana)
    quartaFeira.setDate(inicioSemana.getDate() + 2)
    return { segunda: segundaFeira, quarta: quartaFeira }
  }, [semanaAtual])

  const navegarSemana = useCallback((direcao: "prev" | "next") => {
    setSemanaAtual((semanaAnterior) => {
      const novaData = new Date(semanaAnterior)
      const offset = direcao === "next" ? 7 : -7
      novaData.setDate(semanaAnterior.getDate() + offset)
      return novaData
    })
  }, [])

  const irParaSemanaAtual = useCallback(() => {
    setSemanaAtual(obterInicioSemanaAtual())
  }, [])

  const eSemanaAtual = useMemo(() => {
    return semanaAtual.getTime() === obterInicioSemanaAtual().getTime()
  }, [semanaAtual])

  const mentoriasDaSemana = useMemo(() => {
    return listaMentorias.filter(
      (m) =>
        saoMesmaDataUTC(m.horario.data, segunda) ||
        saoMesmaDataUTC(m.horario.data, quarta)
    )
  }, [listaMentorias, segunda, quarta])

  const alterarStatus = (valor: StatusFiltro | string) => {
    setStatusSelecionado(valor)
  }

  return (
    <Card className="flex flex-col p-5 gap-4 h-full flex-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
        <Button
          variant="outline"
          onClick={irParaSemanaAtual}
          className="text-xs max-sm:hidden"
          disabled={eSemanaAtual}
        >
          Semana Atual
        </Button>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navegarSemana("prev")}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="capitalize text-lg max-md:text-base max-sm:text-sm">
            {formatarMesAno(segunda)}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navegarSemana("next")}
            aria-label="Próxima semana"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Select value={statusSelecionado} onValueChange={alterarStatus}>
          <SelectTrigger className="w-full md:min-w-fit max-w-[200px] max-md:max-w-[120px]">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            {DADOS_STATUS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="h-full flex-1 overflow-hidden p-0">
        <div className="grid grid-cols-[80px_1fr_1fr] max-md:grid-cols-[60px_1fr_1fr] gap-0 border border-border rounded-t-lg bg-background/30">
          <div className="border-r border-border p-4 px-2 text-center text-sm max-md:text-xs font-medium text-muted-foreground">
            Horário
          </div>
          <div className="border-r border-border p-4 text-center">
            <div className="text-sm max-md:text-xs font-medium text-muted-foreground">
              Segunda-feira
            </div>
            <div className="text-xl max-md:text-lg max-sm:text-base font-bold">
              {formatarData(segunda)}
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="text-sm max-md:text-xs font-medium text-muted-foreground">
              Quarta-feira
            </div>
            <div className="text-xl max-md:text-lg max-sm:text-base font-bold">
              {formatarData(quarta)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[80px_1fr_1fr] max-md:grid-cols-[60px_1fr_1fr] gap-0 border border-border border-t-0 rounded-b-lg overflow-auto h-full flex-1">
          {HORARIOS.map((horario, index) => {
            const eUltimo = index === HORARIOS.length - 1
            return (
              <React.Fragment key={horario.slot}>
                <div
                  className={cn(
                    "border-r border-border p-2 text-sm max-md:text-xs text-muted-foreground bg-background/10 text-center flex flex-col justify-center",
                    !eUltimo && "border-b"
                  )}
                >
                  <div className="font-medium">{horario.time}</div>
                </div>
                <CelulaHorario
                  data={segunda}
                  horario={horario}
                  eUltimo={eUltimo}
                  eSegunda={true}
                  mentorias={mentoriasDaSemana}
                  carregando={carregando}
                  setListaMentorias={setListaMentorias}
                />
                <CelulaHorario
                  data={quarta}
                  horario={horario}
                  eUltimo={eUltimo}
                  eSegunda={false}
                  mentorias={mentoriasDaSemana}
                  carregando={carregando}
                  setListaMentorias={setListaMentorias}
                />
              </React.Fragment>
            )
          })}
        </div>
      </CardContent>

      <CardFooter>
        <CardDescription className="text-center w-full">
          {mentoriasDaSemana.length > 0
            ? `${mentoriasDaSemana.length} mentoria${
                mentoriasDaSemana.length !== 1 ? "s" : ""
              } esta semana`
            : "Nenhuma mentoria esta semana"}
        </CardDescription>
      </CardFooter>
    </Card>
  )
}
