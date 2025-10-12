'use client'

import { useEffect, useState } from "react"
import { Tema } from "@/app/generated/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { format } from "date-fns"
import { DeleteButton } from "./ui/delete-button"
import { FormularioTema } from "./formulario-tema"
import { DeletarTema, ListarTemas } from "@/actions/avaliacao"
import { FaFileContract } from "react-icons/fa";
import { toast } from "sonner"
import { InputBusca } from "./input-busca"
import { useSearchParams } from "next/navigation"

interface ModalTemasProps {
  temas: Tema[];
}

export function TabelaTemas({ temas }: ModalTemasProps) {
  const [listaTemas, setListTemas] = useState<Tema[]>([])

  const searchParams = useSearchParams()
  const busca = searchParams.get('busca')

  useEffect(() => {
    setListTemas(temas)
  }, [temas])

  useEffect(() => {
    let isMounted = true;

    const buscarAvaliacoes = async () => {
      if (busca) {
        const resultadoBusca = await ListarTemas(busca)

        if (isMounted) {
          setListTemas(resultadoBusca)
        }
      }
    };

    buscarAvaliacoes()

    return () => {
      isMounted = false;
    };

  }, [busca])


  async function ExcluirTema(id: number) {
    try {
      await DeletarTema(id)
      toast.success(`O tema foi excluído com sucesso`)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='bg-card rounded-lg shadow-sm p-4 flex flex-col gap-4'>
      <div className="flex items-center max-w-md relative">
        <InputBusca
          placeholder='Buscar por titulo'
        />
      </div>
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
          {listaTemas.map((tema) => (
            <TableRow key={tema.id}>
              <TableCell className="w-[54px]">{tema.id}</TableCell>
              <TableCell>{tema.nome}</TableCell>
              <TableCell>{format(new Date(tema.createdAt), "dd/MM/yyyy")}</TableCell>
              <TableCell className="w-[54px]">
                <div className="flex items-center justify-center gap-4">
                  <FormularioTema tema={tema} />
                  <DeleteButton onClick={() => ExcluirTema(tema.id)} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}