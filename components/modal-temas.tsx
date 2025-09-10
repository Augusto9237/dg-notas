'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { FilePenLine, Plus } from "lucide-react"
import { useState } from "react"
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
import { EditButton } from "./ui/edit-button"

interface ModalTemasProps {
  temas: Tema[];
}

export function ModalTemas({ temas }: ModalTemasProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FilePenLine />
          Temas
        </Button>
      </DialogTrigger>
      <DialogContent>
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
            {temas.map((tema) => (
              <TableRow key={tema.id}>
                <TableCell>{tema.id}</TableCell>
                <TableCell>{tema.nome}</TableCell>
                <TableCell>{format(new Date(tema.createdAt), "dd/MM/yyyy")}</TableCell>
                <TableCell className="max-w-[54px]">
                  <div className="flex items-center justify-center gap-4">
                    <EditButton />
                    <DeleteButton />
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