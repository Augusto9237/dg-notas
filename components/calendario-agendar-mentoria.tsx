"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Nomes dos dias da semana para exibição
const DIAS_DA_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda - feira" },
  { value: 2, label: "Terça - feira" },
  { value: 3, label: "Quarta - feira" },
  { value: 4, label: "Quinta - feira" },
  { value: 5, label: "Sexta - feira" },
  { value: 6, label: "Sábado" },
]

// Nomes dos meses para exibição
const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

/**
 * Props para o componente CalendarioAgendarMentoria.
 */
interface PropsCalendarioDoisDiasDaSemana {
  primeiroDiaSemana: number // 0 = Domingo, 1 = Segunda, etc.
  segundoDiaSemana: number
  selecionado?: Date
  aoSelecionar?: (data: Date | undefined) => void
  nomeClasse?: string
}

/**
 * Componente de calendário para agendar mentorias, exibindo apenas dois dias da semana configuráveis.
 */
export function CalendarioAgendarMentoria({
  primeiroDiaSemana,
  segundoDiaSemana,
  selecionado,
  aoSelecionar,
}: PropsCalendarioDoisDiasDaSemana) {
  // Estado para a data atual exibida no calendário
  const [dataAtual, setDataAtual] = useState(new Date())

  // Obtém o ano e mês da data atual
  const ano = dataAtual.getFullYear()
  const mes = dataAtual.getMonth()

  /**
   * Gera pares de datas filtradas para os dois dias da semana configurados no mês atual.
   * As datas são agrupadas por semana, garantindo que o primeiro dia da semana apareça na primeira coluna
   * e o segundo na segunda coluna do grid.
   * @returns Um array de tuplas, onde cada tupla contém [dataPrimeiroDiaSemana, dataSegundoDiaSemana],
   *          com null se o dia não existir na semana.
   */
  const obterParesDeDatasFiltradas = (): Array<[Date | null, Date | null]> => {
    const paresDeDatas: Array<[Date | null, Date | null]> = []
    const diasNoMes = new Date(ano, mes + 1, 0).getDate() // Último dia do mês

    const diasPrimeiroDiaSemana: Date[] = []
    const diasSegundoDiaSemana: Date[] = []

    // Coleta todas as datas do mês para o primeiro e segundo dia da semana configurados
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(ano, mes, dia)
      if (data.getDay() === primeiroDiaSemana) {
        diasPrimeiroDiaSemana.push(data)
      } else if (data.getDay() === segundoDiaSemana) {
        diasSegundoDiaSemana.push(data)
      }
    }

    // Ordena as datas cronologicamente
    diasPrimeiroDiaSemana.sort((a, b) => a.getTime() - b.getTime())
    diasSegundoDiaSemana.sort((a, b) => a.getTime() - b.getTime())

    // Mapeia e agrupa as datas por semana calendário para alinhamento
    // A chave da semana é gerada a partir do domingo daquela semana
    const mapaSemana = new Map<string, { primeiro?: Date, segundo?: Date }>();

    // Combina e itera sobre todas as datas relevantes para popular o mapa da semana
    [...diasPrimeiroDiaSemana, ...diasSegundoDiaSemana].forEach(data => {
      const dataTemp = new Date(data);
      // Normaliza para o início da semana (Domingo) para criar uma chave única de semana
      dataTemp.setDate(dataTemp.getDate() - dataTemp.getDay());
      const chaveDaSemana = `${dataTemp.getFullYear()}-${dataTemp.getMonth()}-${dataTemp.getDate()}`;

      if (!mapaSemana.has(chaveDaSemana)) {
        mapaSemana.set(chaveDaSemana, {});
      }
      const entradaSemana = mapaSemana.get(chaveDaSemana)!;

      // Atribui a data ao slot correto (primeiro ou segundo dia da semana)
      if (data.getDay() === primeiroDiaSemana) {
        entradaSemana.primeiro = data;
      } else if (data.getDay() === segundoDiaSemana) {
        entradaSemana.segundo = data;
      }
    });

    // Ordena as chaves das semanas cronologicamente para garantir o fluxo correto do mês
    const chavesDeSemanasOrdenadas = Array.from(mapaSemana.keys()).sort((a, b) => {
      const [ay, am, ad] = a.split('-').map(Number);
      const [by, bm, bd] = b.split('-').map(Number);
      return new Date(ay, am, ad).getTime() - new Date(by, bm, bd).getTime();
    });

    // Constrói o array final de pares de datas
    chavesDeSemanasOrdenadas.forEach(chaveDaSemana => {
      const entrada = mapaSemana.get(chaveDaSemana)!;
      paresDeDatas.push([entrada.primeiro || null, entrada.segundo || null]);
    });

    return paresDeDatas
  }

  // Pares de datas a serem exibidos no calendário
  const paresDeDatasFiltradas = obterParesDeDatasFiltradas()

  /**
   * Lida com o clique para navegar para o mês anterior.
   */
  const handleMesAnterior = () => {
    setDataAtual(new Date(ano, mes - 1, 1))
  }

  /**
   * Lida com o clique para navegar para o próximo mês.
   */
  const handleProximoMes = () => {
    setDataAtual(new Date(ano, mes + 1, 1))
  }

  /**
   * Verifica se a data fornecida é a data de hoje.
   * @param data A data a ser verificada.
   * @returns true se for hoje, false caso contrário.
   */
  const ehHoje = (data: Date) => {
    const hoje = new Date()
    return (
      data.getDate() === hoje.getDate() &&
      data.getMonth() === hoje.getMonth() &&
      data.getFullYear() === hoje.getFullYear()
    )
  }

  /**
   * Verifica se a data fornecida está selecionada.
   * @param data A data a ser verificada.
   * @returns true se estiver selecionada, false caso contrário.
   */
  const estaSelecionado = (data: Date) => {
    if (!selecionado) return false
    return (
      data.getDate() === selecionado.getDate() &&
      data.getMonth() === selecionado.getMonth() &&
      data.getFullYear() === selecionado.getFullYear()
    )
  }

  /**
   * Lida com o clique em uma data do calendário.
   * @param data A data que foi clicada.
   */
  const handleCliqueNaData = (data: Date) => {
    if (aoSelecionar) {
      aoSelecionar(data)
    }
  }

  /**
   * Renderiza um botão de data ou um div vazio para manter a estrutura do grid.
   * @param data A data a ser renderizada ou null.
   * @returns Um elemento de botão ou div.
   */
  const renderizarBotaoData = (data: Date | null) => {
    if (!data) {
      // Renderiza um div vazio para manter a estrutura do grid
      return <div key={`vazio-${Math.random()}`} className="h-11 w-full bg-muted rounded-sm"></div>
    }

    return (
      <button
        key={data.toISOString()}
        type="button"
        onClick={() => handleCliqueNaData(data)}
        className={`
          relative h-11 rounded-lg border-1 transition-all
          hover:border-foreground hover:bg-accent
          flex flex-col items-center justify-center
          ${estaSelecionado(data)
            ? "border-primary bg-primary/5 text-primary"
            : ehHoje(data)
              ? "border-primary/50 bg-accent"
              : "border-border bg-card"
          }
        `}
      >
        <span className="text-sm font-bold">{data.getDate()}</span>
        <span className="text-xs opacity-70">{DIAS_DA_SEMANA[data.getDay()].label}</span>
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="bg-transparent" size='sm' onClick={handleMesAnterior} aria-label="Mês anterior" type="button">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <CardTitle className="text-sm font-semibold">
          {MESES[mes]} {ano}
        </CardTitle>

        <Button variant="ghost" className="bg-transparent" size='sm' onClick={handleProximoMes} aria-label="Próximo mês" type="button">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-2">
        {paresDeDatasFiltradas.map((par, index) => (
          // Renderiza dois botões (ou divs vazios) para cada par de datas
          // Mantendo a estrutura de duas colunas por semana
          <div key={`par-${index}`} className="contents">
            {renderizarBotaoData(par[0])} {/* Primeiro dia da semana (coluna 1) */}
            {renderizarBotaoData(par[1])} {/* Segundo dia da semana (coluna 2) */}
          </div>
        ))}
      </div>
    </div>
  )
}