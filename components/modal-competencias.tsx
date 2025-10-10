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
import { EditButton } from "./ui/edit-button"
import { Criterio } from "@/app/generated/prisma"
import { Card } from "./ui/card"
import { ListChecks } from "lucide-react"


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
          Competências
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
              <div className="flex justify-between items-center">
                <div className="space-y-1 flex flex-col">
                  <span className="max-sm:text-sm">{i + 1} - {criterio.nome}</span>
                  <p className="text-xs text-muted-foreground ">{criterio.descricao}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
