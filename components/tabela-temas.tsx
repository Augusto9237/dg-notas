'use client'

import { useEffect, useState, useMemo, useContext, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { Ellipsis, FileCheck2 } from "lucide-react"

import { Avaliacao, Prisma } from "@/app/generated/prisma"
import { AlterarDisponibilidadeTema, DeletarTema, listarTemas } from "@/actions/avaliacao"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { DeleteButton } from "./ui/delete-button"
import { FormularioTema } from "./formulario-tema"
import { InputBusca } from "./input-busca"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { enviarNotificacaoParaTodos } from "@/actions/notificacoes"
import { ContextoAdmin } from "@/context/contexto-admin"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "./ui/pagination"
import { Skeleton } from "./ui/skeleton"


type Tema = Prisma.TemaGetPayload<{
  include: {
    professor: true,
    Avaliacao: true
  }
}>

interface Props {
  temasIniciais: Tema[];
  totalPaginas: number;
  limite: number;
  totalTemas: number;
}

export function TabelaTemas({ temasIniciais, totalPaginas, limite, totalTemas }: Props) {
  const [temas, setTemas] = useState<Tema[]>(temasIniciais);
  const [totalItems, setTotalItems] = useState(totalTemas);
  const [totalPages, setTotalPages] = useState(totalPaginas);
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams();
  const router = useRouter()
  const pathname = usePathname()

  const busca = searchParams.get('busca');
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    if (currentPage === 1 && !busca) {
      setTemas(temasIniciais);
      setTotalItems(totalTemas);
      setTotalPages(totalPaginas);
      return;
    }

    const buscarDados = async () => {
      setIsLoading(true);
      try {
        const resultado = await listarTemas(busca || undefined, currentPage, 12);
        setTemas(resultado.data);
        setTotalItems(resultado.meta.total);      // ← faltava
        setTotalPages(resultado.meta.totalPages);  // ← faltava
      } catch (error) {
        console.error("Erro ao buscar temas:", error);
        toast.error("Erro ao carregar temas");
      } finally {
        setIsLoading(false);
      }
    };

    buscarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, currentPage])

  function atualizarDisponibilidadeTema(temaId: number, status: boolean) {
    startTransition(async () => {
      try {
        await AlterarDisponibilidadeTema(temaId, status)
        toast.success('Status do tema atualizado com sucesso')
      } catch {
        toast.error('Erro ao atualizar status')
      }
    })
  }

  async function excluirTema(id: number) {
    try {
      await DeletarTema(id);
      setTemas(temasAnteriores => temasAnteriores.filter(tema => tema.id !== id));
      toast.error("O tema foi excluído");
      await enviarNotificacaoParaTodos(
        'user',
        'Tema excluído',
        `O Tema teste foi excluído`,
        '/aluno/avaliacoes'
      )
    } catch (error) {
      console.error("Erro ao excluir o tema:", error);
      toast.error("Ocorreu um erro ao excluir o tema");
    }
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  };

  function handlePreviousPage() {
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
        <InputBusca placeholder='Buscar por Tema' />
      </div>
      <div className='w-full h-full flex-1'>
        <Table className='h-full'>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Tema</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Data de Entrega</TableHead>
              <TableHead className="text-center max-w-[100px]">Disponível</TableHead>
              <TableHead className="text-center max-w-[54px]">
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
                    <TableCell><Skeleton className='h-9 rounded-sm' /></TableCell>
                    <TableCell><Skeleton className='h-9 rounded-sm' /></TableCell>
                    <TableCell><Skeleton className='h-9 rounded-sm' /></TableCell>
                    <TableCell><Skeleton className='h-9 rounded-sm' /></TableCell>
                    <TableCell><Skeleton className='h-9 rounded-sm' /></TableCell>
                    <TableCell><Skeleton className='h-9 rounded-sm' /></TableCell>
                  </TableRow>
                ))}
              </>
            ) : temas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhum tema encontrado
                </TableCell>
              </TableRow>
            ) : (
              temas.map((tema) => (
                <TableRow key={tema.id}>
                  <TableCell className="w-[54px]">{tema.id}</TableCell>
                  <TableCell className="max-w-[150px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[700px] 2xl:max-w-[1000px] truncate" title={tema.nome}>{tema.nome}</TableCell>
                  <TableCell>{format(new Date(tema.createdAt), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{tema.entrega ? format(new Date(tema.entrega!), "dd/MM/yyyy") : '-'}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={tema.disponivel}
                      disabled={isPending}
                      onCheckedChange={(checked) => atualizarDisponibilidadeTema(tema.id, checked)}
                    />
                  </TableCell>
                  <TableCell className="w-[54px]">
                    <div className="flex items-center justify-center gap-4">
                      {tema.Avaliacao.length > 0 ? (
                        <Link href={`/admin/avaliacoes/${tema.id}`} passHref>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" className="relative">
                                {/* badge */}
                                <FileCheck2 />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Redações</TooltipContent>
                          </Tooltip>
                        </Link>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" disabled className="relative">
                              <FileCheck2 />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Sem redações</TooltipContent>
                        </Tooltip>
                      )}
                      <FormularioTema tema={tema} />
                      <DeleteButton onClick={() => excluirTema(tema.id)} />
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
          {totalTemas > 0 ? currentPage * 1 : 0} -{' '}
          {Math.min(currentPage * limite, totalTemas)} de {totalTemas} resultados
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
