"use client"

import * as React from "react"
import { ArrowLeft, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

type ButtonBackProps = React.ComponentProps<typeof Button>

function ButtonBack({
  children = "Voltar",
  onClick,
  ...props
}: ButtonBackProps) {
  const router = useRouter()

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)

    if (!event.defaultPrevented) {
      router.back()
    }
  }

  return (
    <Button onClick={handleClick} {...props} size="icon" variant="ghost" className="bg-transparent hover:bg-background text-primary">
      <ChevronLeft aria-hidden="true" />
    </Button>
  )
}

export { ButtonBack }