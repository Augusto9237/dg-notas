'use client'

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Criterio } from "@/app/generated/prisma"
import { Card } from "./ui/card"
import { ListChecks } from "lucide-react"
import { FormularioCriterio } from "./formulario-criterio"
import { Label } from "./ui/label"


interface ModalCompetenciasProps {
  criterios: Criterio[];
}

export function ModalCompetencias({ criterios }: ModalCompetenciasProps) {
  const [open, setOpen] = useState(false)
  const [listaCriterios, setListCriterios] = useState<Criterio[]>([]);

  useEffect(() => {
    setListCriterios(criterios)
  }, [criterios, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ListChecks />
          <span className="max-sm:hidden">
            Competências
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            Competências
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {listaCriterios.map((criterio, i) => (
            <Card className="gap-2 p-4" key={criterio.id}>
              <div className="flex justify-between gap-1 items-center">
                <div className="h-full  w-full space-y-1">
                  <Label >{i + 1} - {criterio.nome}</Label>
                  <p className="text-xs text-muted-foreground ">{criterio.descricao}</p>
                  <p className="text-xs text-muted-foreground ">Pont. Máxima: {criterio.pontuacaoMax}</p>
                </div>
                <FormularioCriterio criterio={criterio} />
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
