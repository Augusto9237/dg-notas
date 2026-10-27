"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Bookmark,
  Check,
  CirclePlay,
  Clock3,
  Play,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

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
  const isComplete = ["concluída", "concluida", "concluído", "concluido"].includes(
    status?.toLowerCase() ?? "",
  )

  return (
    <Card className="flex flex-col sm:flex-row sm:items-start sm:gap-5 p-0 sm:p-5 overflow-hidden">
      <Link
        href={href}
        aria-label={`Assistir ${title}`}
        className="group relative aspect-video w-full overflow-hidden rounded-lg max-sm:rounded-none bg-primary text-card sm:w-[min(22vw,15.75rem)]"
      >
        <Image
          src={instructorImage || "/foto-1.jpeg"}
          alt={instructorName}
          fill
          sizes="(max-width: 640px) 100vw, 252px"
          className="w-[48%] object-cover object-[center_30%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-transparent via-primary/45 to-primary"
        />
        <span className="absolute right-3 top-3 max-w-[48%] text-right text-xs font-semibold leading-tight text-white sm:text-sm">
          {title}
        </span>
        <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-primary/80 shadow-lg transition-transform group-hover:scale-105">
          <Play aria-hidden="true" className="ml-0.5 size-5 fill-current" />
        </span>
        {duration ? (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">
            {duration}
          </span>
        ) : null}
      </Link>

      <div className="min-w-0 flex-1 max-sm:px-5">
        <p className="text-xs font-medium text-primary/75">{lessonLabel}</p>
        <Link href={href} className="group block">
          <h3 className="mt-1 text-base font-bold leading-snug text-primary sm:text-lg truncate">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-primary sm:text-sm">
          {duration ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 aria-hidden="true" className="size-4" />
              {duration}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Bookmark aria-hidden="true" className="size-4" />
            {instructorRole}
          </span>
          {level ? (
            <span className="text-muted-foreground">Nível {level}</span>
          ) : null}
          {progressValue !== undefined ? (
            <span className="text-muted-foreground">
              {progressValue}% concluído
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center max-sm:px-5 max-sm:pb-5 justify-between gap-3 sm:flex-col sm:items-end sm:justify-between sm:gap-8 sm:h-full">
        {status ? (
          <Badge
            className={`${
              isComplete
                ? "bg-emerald-100 text-emerald-700"
                : "bg-primary/8 text-primary"
            }`}
          >
            {isComplete ? (
              <Check aria-hidden="true" className="size-3.5" />
            ) : (
              <CirclePlay aria-hidden="true" className="size-3.5" />
            )}
            {status}
          </Badge>
        ) : <span />}
        <Link
          href={href}
        >
          <Button>
          <Play aria-hidden="true" className="fill-current" />
          {isComplete ? "Assistir novamente" : "Assistir agora"}
          </Button>
        </Link>
      </div>
    </Card>
  )
}
