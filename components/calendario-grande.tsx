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
import { cn } from "@/lib/utils"
import {
  DiaSemana,
  Prisma,
  SlotHorario,
} from "@/app/generated/prisma"
import React from "react"
import { ModalMentoriaProfessor } from "./modal-mentoria-professor"
import { excluirMentoriaECascata } from "@/actions/mentoria"
import { toast } from "sonner"
import { array } from "zod"

// Types
type Mentoria = Prisma.MentoriaGetPayload<{
  include: {
    aluno: true
    horario: {
      include: {
        slot: true
      }
    }
  }
}>

interface CalendarioGrandeProps {
  mentorias: Mentoria[]
  diasSemana: DiaSemana[]
  slotsHorario: SlotHorario[]
}


// Constantes
const STATUS_OPCOES = [
  { label: "Agendada", value: "AGENDADA" },
  { label: "Realizada", value: "REALIZADA" },
  { label: "Todas", value: "TODAS" },
] as const

const LOADING_DELAY = 300

// Funções Utilitárias
const obterInicioSemanaAtual = (): Date => {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const diaSemana = hoje.getDay()
  const offsetSegunda = diaSemana === 0 ? 1 : -(diaSemana - 1)
  const segunda = new Date(hoje)
  segunda.setDate(hoje.getDate() + offsetSegunda)
  return segunda
}

const formatarData = (data: Date): string => {
  return data.toLocaleDateString("pt-BR", { day: "2-digit" })
}

const formatarMesAno = (data: Date): string => {
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
  slotHorario: SlotHorario
  eUltimo: boolean
  eSegunda: boolean
  mentorias: Mentoria[]
  carregando: boolean
  setListaMentorias: React.Dispatch<React.SetStateAction<Mentoria[]>>
  diasSemana: DiaSemana[]
  slotsHorario: SlotHorario[]
}

const CelulaHorario = React.memo(
  ({
    data,
    slotHorario,
    eUltimo,
    eSegunda,
    mentorias,
    carregando,
    setListaMentorias,
    diasSemana,
    slotsHorario,
  }: CelulaHorarioProps) => {
    const mentoriasDoSlot = useMemo(
      () =>
        mentorias.filter(
          (m) =>
            saoMesmaDataUTC(m.horario.data, data) &&
            m.horario.slotId === slotHorario.id
        ),
      [mentorias, data, slotHorario.id]
    )

    return (
      <div
        className={cn(
          "p-2 hover:bg-muted/20 transition-colors",
          "grid grid-cols-2 max-[1025px]:grid-cols-1 grid-rows-2 max-[1025px]:grid-rows-4 gap-2 max-sm:gap-1",
          "overflow-hidden",
          eSegunda && "border-r border-border",
          !eUltimo && "border-b"
        )}
      >
        {carregando ? (
          <Skeleton className="w-full h-full col-span-full row-span-full bg-background" />
        ) : (
          <>
            {mentoriasDoSlot.length === 0 && Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-center text-muted-foreground text-xs max-sm:h-9 sm:min-h-[50px] h-full bg-background/30 rounded-lg">
              </div>
            ))}
            {mentoriasDoSlot.map((mentoria) => (
              <ModalMentoriaProfessor key={mentoria.id} mentoria={mentoria} setListaMentorias={setListaMentorias} diasSemana={diasSemana} slotsHorario={slotsHorario} />
            ))}
          </>
        )}
      </div>
    )
  }
)
CelulaHorario.displayName = "CelulaHorario"

// Componente Principal
export function CalendarioGrande({
  mentorias,
  diasSemana,
  slotsHorario
}: CalendarioGrandeProps) {
  const [statusSelecionado, setStatusSelecionado] = useState<string>("TODAS")
  const [semanaAtual, setSemanaAtual] = useState(obterInicioSemanaAtual)
  const [listaMentorias, setListaMentorias] = useState<Mentoria[]>(mentorias)
  const [carregando, setCarregando] = useState(false)


  const HORA_LIMITE_EXCLUSAO = 17

  useEffect(() => {
    const agora = new Date()

    // Verifica se a hora atual é depois do horário limite
    if (agora.getHours() >= HORA_LIMITE_EXCLUSAO) {
      const mentoriasParaRemover = mentorias.filter(mentoria => {
        // Verifica se a mentoria é do dia de hoje
        const ehHoje = saoMesmaDataUTC(mentoria.horario.data, agora)
        const estaAgendada = mentoria.status === 'AGENDADA'

        return ehHoje && estaAgendada
      })

      // Exclui todas as mentorias em paralelo e exibe uma única notificação
      if (mentoriasParaRemover.length > 0) {
        Promise.all(
          mentoriasParaRemover.map(mentoria => excluirMentoriaECascata(mentoria.id))
        ).then(() => {
          toast.error(
            `${mentoriasParaRemover.length} mentoria${mentoriasParaRemover.length > 1 ? 's' : ''} não confirmada${mentoriasParaRemover.length > 1 ? 's foram' : ' foi'} excluída${mentoriasParaRemover.length > 1 ? 's' : ''} automaticamente`
          )
        }).catch((erro) => {
          console.error('Erro ao excluir mentorias:', erro)
          toast.error('Erro ao excluir mentorias não confirmadas')
        })
      }
    }
  }, [mentorias]);


  const diasSemanaAtivos = useMemo(() =>
    diasSemana.filter(dia => dia.status),
    [diasSemana]
  )

  const slotsHorarioAtivos = useMemo(() =>
    slotsHorario.filter(slot => slot.status),
    [slotsHorario]
  )

  useEffect(() => {
    setCarregando(true)
    const mentoriasFiltradas =
      statusSelecionado === "TODAS"
        ? mentorias
        : mentorias.filter((m) => m.status === statusSelecionado)
    setListaMentorias(mentoriasFiltradas)
    const timer = setTimeout(() => setCarregando(false), LOADING_DELAY)
    return () => clearTimeout(timer)
  }, [mentorias, statusSelecionado])

  // Calcular dias da semana baseado nos dias ativos
  const diasDaSemana = useMemo(() => {
    const inicioSemana = new Date(semanaAtual)
    const dias: { [key: string]: Date } = {}

    diasSemanaAtivos.forEach(dia => {
      const dataDia = new Date(inicioSemana)
      dataDia.setDate(inicioSemana.getDate() + (dia.dia - 1))
      dias[dia.nome.toLowerCase()] = dataDia
    })

    return dias
  }, [semanaAtual, diasSemanaAtivos])

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
    return listaMentorias.filter((m) =>
      Object.values(diasDaSemana).some(data =>
        saoMesmaDataUTC(m.horario.data, data)
      )
    )
  }, [listaMentorias, diasDaSemana])

  const alterarStatus = (valor: string) => {
    setStatusSelecionado(valor)
  }

  const gridColsClass = useMemo(() => {
    const classMap: { [key: number]: string } = {
      1: 'grid-cols-[80px_1fr]',
      2: 'grid-cols-[80px_1fr_1fr]',
      3: 'grid-cols-[80px_1fr_1fr_1fr]',
      4: 'grid-cols-[80px_1fr_1fr_1fr_1fr]',
      5: 'grid-cols-[80px_1fr_1fr_1fr_1fr_1fr]',
      6: 'grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr]',
      7: 'grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr]',
    };
    return classMap[diasSemanaAtivos.length] || '';
  }, [diasSemanaAtivos.length]);

  return (
    <Card className="flex flex-col p-5 gap-4 h-full flex-1">
      <CardHeader className="grid grid-cols-3 p-0">
        <div>
          <Button
            variant='ghost'
            onClick={irParaSemanaAtual}
            className="text-xs max-sm:hidden"
            disabled={eSemanaAtual}
          >
            Semana Atual
          </Button>
        </div>

        <div className="flex justify-center items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navegarSemana("prev")}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="capitalize max-md:text-base max-sm:text-sm">
            {formatarMesAno(Object.values(diasDaSemana)[0] || semanaAtual)}
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

        <div className="flex justify-end">
          <Select value={statusSelecionado} onValueChange={alterarStatus}>
            <SelectTrigger className="w-full md:min-w-fit max-w-[100px] max-md:max-w-[120px]">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPCOES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="h-full flex-1 overflow-hidden p-0 pb-22">
        <div className={cn('grid gap-0 border border-border rounded-t-lg bg-background/30', gridColsClass)}>
          <div className="border-r border-border p-4 px-2 text-center text-sm max-md:text-xs font-medium text-muted-foreground">
            Horário
          </div>
          {diasSemanaAtivos.map((dia, index) => (
            <div
              key={dia.id}
              className={`p-4 text-center ${index < diasSemanaAtivos.length - 1 ? 'border-r border-border' : ''}`}
            >
              <div className="text-sm max-md:text-xs font-medium text-muted-foreground">
                {dia.nome}
              </div>
              <div className="text-xl max-md:text-lg max-sm:text-base font-bold">
                {formatarData(diasDaSemana[dia.nome.toLowerCase()])}
              </div>
            </div>
          ))}
        </div>

        <div className={cn('grid gap-0 border border-border border-t-0 rounded-b-lg overflow-auto h-full flex-1', gridColsClass)}>
          {slotsHorarioAtivos.map((slot, index) => {
            const eUltimo = index === slotsHorarioAtivos.length - 1
            return (
              <React.Fragment key={slot.id}>
                <div
                  className={cn(
                    "border-r border-border p-2 text-sm max-md:text-xs bg-background/30 text-muted-foreground  text-center flex flex-col justify-center",
                    !eUltimo && "border-b"
                  )}
                >
                  <p className="font-medium">{slot.nome.split(" ")[0]}</p>
                </div>
                {diasSemanaAtivos.map((dia, diaIndex) => (
                  <CelulaHorario
                    key={`${slot.id}-${dia.id}`}
                    data={diasDaSemana[dia.nome.toLowerCase()]}
                    slotHorario={slot}
                    eUltimo={eUltimo}
                    eSegunda={diaIndex === 0}
                    mentorias={mentoriasDaSemana}
                    carregando={carregando}
                    setListaMentorias={setListaMentorias}
                    diasSemana={diasSemana}
                    slotsHorario={slotsHorario}
                  />
                ))}
              </React.Fragment>
            )
          })}
        </div>
      </CardContent>

      <CardFooter>
        <CardDescription className="text-center w-full">
          {mentoriasDaSemana.length > 0
            ? `${mentoriasDaSemana.length} mentoria${mentoriasDaSemana.length !== 1 ? "s" : ""
            } esta semana`
            : "Nenhuma mentoria esta semana"}
        </CardDescription>
      </CardFooter>
    </Card>
  )
}
