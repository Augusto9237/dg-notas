'use client'

import { useEffect, useState, useMemo, useContext, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { Ellipsis, FileCheck2 } from "lucide-react"

import { Avaliacao, Prisma } from "@/app/generated/prisma"
import { AlterarDisponibilidadeTema, DeletarTema, ListarTemas, ListarAvaliacoes } from "@/actions/avaliacao"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { DeleteButton } from "./ui/delete-button"
import { FormularioTema } from "./formulario-tema"
import { InputBusca } from "./input-busca"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { enviarNotificacaoParaTodos } from "@/actions/notificacoes"
import { ContextoProfessor } from "@/context/contexto-professor"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "./ui/pagination"


type Tema = Prisma.TemaGetPayload<{
  include: {
    professor: true,
    Avaliacao: true
  }
}>

export function TabelaTemas() {
  const { listaTemas, listaAvaliacoes } = useContext(ContextoProfessor)
  const [temas, setTemas] = useState<Tema[]>(listaTemas?.data || []);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [totalItems, setTotalItems] = useState(listaTemas?.meta?.total || 0);
  const [totalPages, setTotalPages] = useState(listaTemas?.meta?.totalPages || 0);
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams();
  const router = useRouter()
  const pathname = usePathname()

  const busca = searchParams.get('busca');
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    if (listaAvaliacoes) {
      setAvaliacoes(listaAvaliacoes.data);
    }
  }, [listaAvaliacoes]);


  // Buscar temas com paginação
  useEffect(() => {
    const buscarTemas = async () => {
      try {
        if (currentPage === 1 && !busca) {
          setTemas(listaTemas.data);
          setTotalItems(listaTemas.meta.total);
          setTotalPages(listaTemas.meta.totalPages)
        } else {
          const resultadoBusca = await ListarTemas(busca || undefined, currentPage, 12);
          setTemas(resultadoBusca.data);
          setTotalItems(resultadoBusca.meta.total);
          setTotalPages(resultadoBusca.meta.totalPages)
        }
      } catch (error) {
        console.error("Erro ao buscar temas:", error);
        toast.error("Erro ao buscar temas");
      }
    };

    buscarTemas();
  }, [busca, currentPage, listaTemas]);

  // Buscar avaliações com paginação
  useEffect(() => {
    const buscarAvaliacoes = async () => {
      try {
        const resultado = await ListarAvaliacoes(undefined, undefined, currentPage, 12);
        setAvaliacoes(resultado.data);
      } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
      }
    };

    buscarAvaliacoes();
  }, [currentPage]);


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
              <TableHead className="text-center max-w-[54px]">Disponível</TableHead>
              <TableHead className="text-center max-w-[54px]">
                <div className='flex justify-center w-full'>
                  <Ellipsis />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {temas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhum tema encontrado
                </TableCell>
              </TableRow>
            ) : (
              temas.map((tema) => (
                <TableRow key={tema.id}>
                  <TableCell className="w-[54px]">{tema.id}</TableCell>
                  <TableCell>{tema.nome}</TableCell>
                  <TableCell>{format(new Date(tema.createdAt), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={tema.disponivel}
                      disabled={isPending}
                      onCheckedChange={(checked) => atualizarDisponibilidadeTema(tema.id, checked)}
                    />
                  </TableCell>
                  <TableCell className="w-[54px]">
                    <div className="flex items-center justify-center gap-4">
                      <Link href={tema.Avaliacao.filter((avaliacao) => avaliacao.status === 'ENVIADA').length > 0 ? `/professor/avaliacoes/${tema.id}` : '/professor/avaliacoes'} passHref>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              className="hover:cursor-pointer relative"
                              variant={tema.Avaliacao.filter((avaliacao) => avaliacao.status === 'ENVIADA').length > 0 ? 'default' : 'ghost'}
                              disabled={tema.Avaliacao.filter((avaliacao) => avaliacao.status === 'ENVIADA').length === 0}
                            >
                              {tema.Avaliacao.filter((avaliacao) => avaliacao.status === 'ENVIADA').length > 0 ? (
                                <span className="absolute -right-1 -top-1 flex size-4">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75"></span>
                                  <span className="relative flex justify-center items-center size-4 rounded-full bg-secondary text-[0.60rem] text-center text-card border border-secondary">{tema.Avaliacao.filter((avaliacao) => avaliacao.status === 'ENVIADA').length}</span>
                                </span>
                              ) : null}
                              <FileCheck2 />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="text-background">
                            <p>Redações</p>
                          </TooltipContent>
                        </Tooltip>
                      </Link>
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
          {totalItems > 0 ? currentPage * 1 : 0} -{' '}
          {Math.min(currentPage * listaTemas.meta.limit, totalItems)} de {totalItems} resultados
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
