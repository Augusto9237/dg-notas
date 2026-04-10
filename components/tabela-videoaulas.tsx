'use client'

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import { Ellipsis } from "lucide-react"

import { Prisma, Videoaula } from "@/app/generated/prisma"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { DeleteButton } from "./ui/delete-button"
import { InputBusca } from "./input-busca"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "./ui/pagination"
import { Skeleton } from "./ui/skeleton"
import { deletarVideoaula, listarVideoaulas } from "@/actions/videoaulas"
import { FormularioVideoaula } from "./formulario-videoaula"
import { ModalVisualizarVideoaula } from "./modal-visualizar-aula"
import { deleteObject, ref } from "firebase/storage"
import { storage } from "@/lib/firebase"


interface TabelaVideoaulasProps {
  videoaulas: {
    data: Videoaula[],
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
}

export function TabelaVideoaulas({ videoaulas }: TabelaVideoaulasProps) {
  const [listaVideoaulas, setListaVideoaulas] = useState<Videoaula[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams();
  const router = useRouter()
  const pathname = usePathname()

  const busca = searchParams.get('busca');
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    if (currentPage === 1 && !busca) {
      setListaVideoaulas(videoaulas.data)
      setTotalItems(videoaulas.meta.total)
      setTotalPages(videoaulas.meta.totalPages)
      return
    }

    const buscarDados = async () => {
      setIsLoading(true)
      try {
        const listaVideoaulas = await listarVideoaulas(busca || undefined, currentPage, 12)
        setListaVideoaulas(listaVideoaulas.data);
      } catch (error) {
        console.error("Erro ao buscar temas:", error)
        toast.error("Erro ao carregar temas")
      } finally {
        setIsLoading(false)
      }
    };

    buscarDados();
  }, [busca, currentPage, videoaulas]);


  function excluirVideoaula(id: number, titulo: string) {
    startTransition(async () => {
      try {
        await deletarVideoaula(id);
        deleteObject(ref(storage, `videoaulas/${titulo}.mp4`));
        setListaVideoaulas(videoaulasAnteriores => videoaulasAnteriores.filter(videoaula => videoaula.id !== id));
        toast.error("A aula foi excluída");

      } catch (error) {
        console.error("Erro ao excluir a aula:", error);
        toast.error("Ocorreu um erro ao excluir a aula");
      }
    })
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div className='bg-card rounded-lg shadow-sm p-5 flex flex-col gap-4 h-full flex-1 justify-between'>
      <div className="flex items-center max-w-md relative">
        <InputBusca placeholder='Buscar por Título' />
      </div>
      <div className='w-full h-full sm:overflow-x-auto'>
        <Table className='w-full table-fixed'>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[54px]">Id</TableHead>
              <TableHead className="w-md max-sm:w-sm">Título</TableHead>
              <TableHead className="w-sm">Descrição</TableHead>
              <TableHead className="w-[160px]">Url do Video</TableHead>
              <TableHead className="text-center w-[120px]">Data</TableHead>
              <TableHead className="w-[120px] text-center">
                <div className='flex justify-center w-full'>
                  <Ellipsis />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {Array.from({ length: 12 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7}>
                      <Skeleton className='h-9 rounded-sm' />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : listaVideoaulas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhuma aula encontrada
                </TableCell>
              </TableRow>
            ) : (
              listaVideoaulas.map((videoaula) => (
                <TableRow key={videoaula.id}>
                  <TableCell>{videoaula.id}</TableCell>
                  <TableCell className="truncate w-md max-sm:w-sm" title={videoaula.titulo}>{videoaula.titulo}</TableCell>
                  <TableCell className="truncate w-sm" title={videoaula.descricao}>{videoaula.descricao}</TableCell>
                  <TableCell className="truncate w-[160px]" title={videoaula.urlVideo}>{videoaula.urlVideo}</TableCell>
                  <TableCell className="text-center w-[100px]">{format(new Date(videoaula.createdAt), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-4">
                      <ModalVisualizarVideoaula videoaula={videoaula} />
                      <FormularioVideoaula aula={videoaula} />
                      <DeleteButton disabled={isPending} onClick={() => excluirVideoaula(videoaula.id, videoaula.titulo)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground md:text-nowrap max-md:hidden">
          {totalItems > 0 ? currentPage * 1 : 0} -{' '}
          {Math.min(currentPage * videoaulas.meta.limit, totalItems)} de {totalItems} resultados
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
