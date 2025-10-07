'use client'

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tema } from "@/app/generated/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { format } from "date-fns"
import { DeleteButton } from "./ui/delete-button"
import { FormularioTema } from "./formulario-tema"
import { DeletarTema } from "@/actions/avaliacao"
import { FaFileContract } from "react-icons/fa";
import { toast } from "sonner"

interface ModalTemasProps {
  temas: Tema[];
}

export function ModalTemas({ temas }: ModalTemasProps) {
  const [open, setOpen] = useState(false)
  const [modalTemas, setModalTemas] = useState<Tema[]>([])

  useEffect(() => {
    if (open) {
      setModalTemas(temas)
    }
  }, [open, temas])


  async function ExcluirTema(id: number) {
    try {
      await DeletarTema(id)
      toast.success(`O tema foi excluído com sucesso`)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(open => !open)}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FaFileContract />
          Temas
        </Button>
      </DialogTrigger>
      <DialogContent style={{maxWidth: '664px'}}>
        <DialogHeader>
          <DialogTitle className="text-center">Temas</DialogTitle>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow >
              <TableHead >Id</TableHead>
              <TableHead >Titulo</TableHead>
              <TableHead >Data</TableHead>
              <TableHead className="text-center max-w-[54px] ">•••</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {modalTemas.map((tema) => (
              <TableRow key={tema.id}>
                <TableCell>{tema.id}</TableCell>
                <TableCell>{tema.nome}</TableCell>
                <TableCell>{format(new Date(tema.createdAt), "dd/MM/yyyy")}</TableCell>
                <TableCell className="max-w-[54px]">
                  <div className="flex items-center justify-center gap-4">
                    <FormularioTema tema={tema} />
                    <DeleteButton onClick={() => ExcluirTema(tema.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}