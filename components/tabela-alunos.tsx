'use client';

import Link from 'next/link';
import { useState, useEffect, useContext, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from '@/components/ui/pagination';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Ellipsis, FileCheck2 } from 'lucide-react';
import { InputBusca } from './input-busca';
import { alterarStatusMatriculaAluno, listarAlunosGoogle } from '@/actions/alunos';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Prisma } from '@/app/generated/prisma';
import { calcularMedia } from '@/lib/media-geral';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { banirUsuario } from '@/actions/admin';
import { toast } from 'sonner';
import { DeleteButton } from './ui/delete-button';
import { ContextoProfessor } from '@/context/contexto-professor';
import { Switch } from './ui/switch';
import { enviarNotificacaoParaUsuario } from '@/actions/notificacoes';
import Image from 'next/image';

type Aluno = Prisma.UserGetPayload<{
  include: {
    avaliacoesComoAluno: true;
  }
}>


export function TabelaAlunos() {
  const { listaAlunos, totalPaginas, pagina: paginaInicialContexto, limite } = useContext(ContextoProfessor)
  const [isPending, startTransition] = useTransition()
  const [alunos, setAlunos] = useState<Aluno[]>(listaAlunos || [])
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const busca = searchParams.get('busca') || ''
  const paginaAtual = Number(searchParams.get('page')) || 1

  const [totalPage, setTotalPage] = useState(totalPaginas || 1)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (paginaAtual === 1 && !busca) {
      setAlunos(listaAlunos)
      setTotalPage(totalPaginas)
      return
    }

    const buscarAlunos = async () => {
      setIsLoading(true)
      try {
        const resultado = await listarAlunosGoogle(busca, paginaAtual, limite)
        setAlunos(resultado.data)
        setTotalPage(resultado.totalPaginas)
      } catch (error) {
        console.error("Erro ao buscar alunos:", error)
        toast.error("Erro ao carregar alunos")
      } finally {
        setIsLoading(false)
      }
    }

    buscarAlunos()
  }, [busca, paginaAtual, listaAlunos, totalPaginas, limite])

  function atualizarMatriculaAluno(id: string, status: boolean) {
    startTransition(async () => {
      try {
        await alterarStatusMatriculaAluno(id, status)
        toast.success('Status da matricula do aluno atualizada com sucesso')
        if (status) {
          await enviarNotificacaoParaUsuario(id, 'Seu acesso ao app foi liberado', "Abra ou recarregue novamente", "/aluno")
        }
      } catch (error) {
        toast.error('Algo deu errado! Tente novamente')
      }
    })
  }

  async function excluirAluno(alundoId: string) {
    try {
      const resposta = await banirUsuario(alundoId)
      toast.error(resposta.message)
      router.refresh()
    } catch (error) {
      console.log(error)
    }
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  };

  const handlePreviousPage = () => {
    if (paginaAtual > 1) {
      handlePageChange(paginaAtual - 1)
    }
  };

  const handleNextPage = () => {
    if (paginaAtual < totalPage) {
      handlePageChange(paginaAtual + 1)
    }
  };

  return (
    <div className='bg-card rounded-lg shadow-sm p-5 flex flex-col gap-4 h-full flex-1 justify-beetwen w-full overflow-hidden'>
      <div className="flex items-center max-w-md relative">
        <InputBusca
          placeholder='Buscar por E-mail'
        />
      </div>
      <div className='w-full h-full flex-1'>
        <Table className='h-full'>
          <TableHeader>
            <TableRow >
              <TableHead className='min-[1025px]:min-w-sm'>Aluno</TableHead>
              <TableHead className='min-[1025px]:min-w-sm'>E-mail</TableHead>
              <TableHead >Telefone</TableHead>
              <TableHead className='text-center'>Matriculado</TableHead>
              <TableHead className=' font-semibold'>Avaliações</TableHead>
              <TableHead className=' font-semibold'>Média</TableHead>
              <TableHead className="text-center">
                <div className='flex justify-center w-full'>
                  <Ellipsis />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : alunos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Nenhum aluno encontrado
                </TableCell>
              </TableRow>
            ) : (
              alunos.map((aluno) => (
                <TableRow key={aluno.id}>
                  <TableCell className='flex gap-2 items-center min-[1025px]:min-w-sm'>
                    <Avatar>
                      <Image alt={aluno.name} src={aluno.image || "/avatar-placeholder.png"} height={40} width={40} />
                      <AvatarFallback>{aluno.name ? aluno.name.charAt(0).toUpperCase() : 'A'}</AvatarFallback>
                    </Avatar>
                    <span className='mt-1'>
                      {aluno.name}
                    </span>
                  </TableCell>
                  <TableCell className='min-[1025px]:min-w-sm'>{aluno.email}</TableCell>
                  <TableCell className=''>{aluno.telefone}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={aluno.matriculado ? aluno.matriculado : false}
                      disabled={isPending}
                      onCheckedChange={(checked) => atualizarMatriculaAluno(aluno.id, checked)}
                    />
                  </TableCell>
                  <TableCell className=' font-semibold text-center'>
                    {aluno.avaliacoesComoAluno.length}
                  </TableCell>
                  <TableCell className='font-semibold text-center'>
                    {calcularMedia(aluno.avaliacoesComoAluno).toFixed(2).replace('.', ',')}
                  </TableCell>
                  <TableCell className="text-center space-x-4">
                    <Link href={`/professor/alunos/${aluno.id}`} passHref>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon">
                            <FileCheck2 />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className='text-card'>
                          <p>Avaliações</p>
                        </TooltipContent>
                      </Tooltip>
                    </Link>
                    <DeleteButton onClick={() => excluirAluno(aluno.id)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-600 md:text-nowrap max-md:hidden">
          {paginaAtual} - {totalPage} de {alunos.length} resultados
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                className={paginaAtual <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPage) }, (_, i) => {
              const startPage = Math.max(1, Math.min(paginaAtual - 2, totalPage - 4));
              return startPage + i;
            }).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === paginaAtual}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
                className={paginaAtual >= totalPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
