"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const WEEKDAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda - feira" },
  { value: 2, label: "Terça - feira" },
  { value: 3, label: "Quarta - feira" },
  { value: 4, label: "Quinta - feira" },
  { value: 5, label: "Sexta - feira" },
  { value: 6, label: "Sábado" },
]

const MONTHS = [
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

interface TwoWeekdayCalendarProps {
  primeiroDia: number // 0 = Sunday, 1 = Monday, etc.
  segundoDia: number
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
}

export function CalendarioAgendarMentoria({
  primeiroDia,
  segundoDia,
  selected,
  onSelect,
}: TwoWeekdayCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const getFilteredDates = () => {
    const dates: Date[] = []
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      if ([primeiroDia, segundoDia].includes(date.getDay())) {
        dates.push(date)
      }
    }

    return dates
  }

  const filteredDates = getFilteredDates()

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date) => {
    if (!selected) return false
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    )
  }

  const handleDateClick = (date: Date) => {
    if (onSelect) {
      onSelect(date)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="bg-transparent" size='sm' onClick={handlePreviousMonth} aria-label="Mês anterior" type="button">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <CardTitle className="text-sm font-semibold">
          {MONTHS[month]} {year}
        </CardTitle>

        <Button variant="ghost" className="bg-transparent" size='sm' onClick={handleNextMonth} aria-label="Próximo mês" type="button">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-2">
        {filteredDates.map((date) => (
          <button
            key={date.toISOString()}
            type="button"
            onClick={() => handleDateClick(date)}
            className={`
                relative h-11 rounded-lg border-1 transition-all
                hover:border-foreground hover:bg-accent
                flex flex-col items-center justify-center
                ${isSelected(date)
                ? "border-primary bg-primary/5 text-primary"
                : isToday(date)
                  ? "border-primary/50 bg-accent"
                  : "border-border bg-card"
              }
              `}
          >
            <span className="text-sm font-bold">{date.getDate()}</span>
            <span className="text-xs opacity-70">{WEEKDAYS[date.getDay()].label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
