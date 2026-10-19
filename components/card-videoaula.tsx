"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ChartNoAxesColumnIncreasing,
  CirclePlay,
  Play,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface CardVideoaulaProps {
  href: string
  lessonLabel: string
  title: string
  description: string
  duration?: string
  instructorName: string
  instructorRole: string
  instructorImage?: string | null
  level?: string
  progress?: number
  status?: string | null
}

export function CardVideoaula({
  href,
  lessonLabel,
  title,
  description,
  duration,
  instructorName,
  instructorRole,
  instructorImage,
  level,
  progress,
  status = "Em andamento",
}: CardVideoaulaProps) {
  const progressValue =
    progress === undefined ? undefined : Math.min(100, Math.max(0, progress))

  return (
    <Card className="max-w-md gap-0 overflow-hidden p-0 shadow-sm">
      <Link
        href={href}
        aria-label={`Assistir ${title}`}
        className="group relative flex aspect-video items-center justify-center overflow-hidden bg-primary text-white"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-br from-primary/75 via-primary to-primary/25"
        />
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-16 size-64 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-36 -left-8 size-80 rounded-full border border-white/10"
        />
        <div className="relative z-10 flex flex-col items-center gap-1 text-center">
          <span className="text-2xl font-semibold tracking-wide text-white/90 sm:text-3xl">
            DG Dani Guedes
          </span>
          <span className="text-[10px] font-medium tracking-[0.4em] text-white/65">
            REDAÇÃO
          </span>
        </div>
        <span className="absolute z-10 grid size-16 place-items-center rounded-full border-2 border-white/80 bg-primary/90 shadow-lg transition-transform group-hover:scale-105">
          <Play aria-hidden="true" className="ml-1 size-7 fill-current" />
        </span>
        {duration ? (
          <span className="absolute bottom-4 right-4 rounded-lg bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
            {duration}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-col gap-5 p-5">
        <Link href={href} className="group space-y-1">
          <p className="text-lg max-sm:text-base font-bold leading-snug text-primary group-hover:underline">
            {lessonLabel} — {title}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </Link>

        <div className="flex items-center gap-3">
          <Image
            src={instructorImage || "/foto-1.jpeg"}
            alt=""
            width={52}
            height={52}
            className="size-10 shrink-0 rounded-full object-cover object-[center_35%]"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground max-sm:text-sm">{instructorName}</p>
            <p className="truncate text-sm max-sm:text-xs text-muted-foreground">{instructorRole}</p>
          </div>
        </div>

        {status || level || duration ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {status ? (
              <span className="flex items-center gap-2 max-sm:text-sm">
                <CirclePlay aria-hidden="true" className="size-4 text-primary/70" />
                {status}
              </span>
            ) : null}
            {status && (level || duration) ? (
              <span aria-hidden="true" className="h-5 w-px bg-border" />
            ) : null}
            {level ? (
              <span className="flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1.5 font-medium text-primary max-sm:text-xs">
                <ChartNoAxesColumnIncreasing aria-hidden="true" className="size-4" />
                Nível {level}
              </span>
            ) : null}
            {duration && !level ? (
              <span className="text-sm text-muted-foreground">{duration}</span>
            ) : null}
          </div>
        ) : null}

        {progressValue !== undefined ? (
          <div className="flex items-end gap-3">
            <div className="min-w-0 flex-1">
              <Progress
                value={progressValue}
                aria-label={`Progresso do curso: ${progressValue}% concluído`}
                className="h-2.5 bg-primary/10"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">{progressValue}%</span>{" "}
                concluído
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
