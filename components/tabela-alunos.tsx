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
import { Ellipsis, FileCheck2, FileDown, Search } from 'lucide-react';
import { InputBusca } from './input-busca';
import { alterarStatusMatriculaAluno, listarAlunosGoogle } from '@/actions/alunos';
import { useSearchParams } from 'next/navigation';
import { Prisma, StatusAvaliacao } from '@/app/generated/prisma';
import { calcularMedia } from '@/lib/media-geral';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { banirUsuario } from '@/actions/admin';
import { toast } from 'sonner';
import { DeleteButton } from './ui/delete-button';
import { ContextoProfessor } from '@/context/contexto-professor';
import { Switch } from './ui/switch';
import { enviarNotificacaoParaUsuario } from '@/actions/notificacoes';

type Aluno = Prisma.UserGetPayload<{
  include: {
    avaliacoesComoAluno: true;
  }
}>


export function TabelaAlunos() {
  const { listaAlunos } = useContext(ContextoProfessor)
  const [carregando, setCarregando] = useState(false);
  const [isPending, startTransition] = useTransition()
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const searchParams = useSearchParams()
  const busca = searchParams.get('busca')

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setCarregando(true);
    if (listaAlunos.length > 0) {
      setAlunos(listaAlunos)
    }
    setCarregando(false);
  }, [listaAlunos]);

  useEffect(() => {
    // Se não houver termo de busca, exibimos a lista completa (cacheada no contexto)
    // Isso evita requisições desnecessárias e restaura o estado instantaneamente
    if (!busca) {
      setAlunos(listaAlunos);
      return;
    }

    let isMounted = true;
    setCarregando(true);

    const buscarAlunos = async () => {
      try {
        const resultadoBusca = await listarAlunosGoogle(busca);

        if (isMounted) {
          setAlunos(resultadoBusca);
        }
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
      } finally {
        if (isMounted) {
          setCarregando(false);
        }
      }
    };

    buscarAlunos();

    return () => {
      isMounted = false;
    };
  }, [busca]);

  function atualizarMatriculaAluno(id: string, status: boolean) {
    startTransition(async () => {
      try {
        await alterarStatusMatriculaAluno(id, status)
        toast.success('Statuas da matricula do aluno atualizada com sucesso')
        await enviarNotificacaoParaUsuario(id, 'Seu acesso ao app foi liberado', "Abra ou recarregue novamente", "/aluno")
      } catch (error) {
        toast.error('Algo deu errado! Tente novamente')
      }
    })
  }

  async function excluirAluno(alundoId: string) {
    try {
      const resposta = await banirUsuario(alundoId)
      toast.error(resposta.message)
    } catch (error) {
      console.log(error)
    }
  }

  // Calcular paginação
  const totalPages = Math.ceil(alunos.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAlunos = alunos.slice(startIndex, endIndex);



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className='bg-card rounded-lg shadow-sm p-5 flex flex-col gap-4 h-full flex-1 justify-beetwen'>
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
              <TableHead className='w-full'>Telefone</TableHead>
              <TableHead className='w-full'>Matriculado</TableHead>
              <TableHead className='w-full max-w-[100px] min-w-[100px] font-semibold'>Avaliações</TableHead>
              <TableHead className='w-full max-w-[64px] min-w-[64px] font-semibold'>Média</TableHead>
              <TableHead className="text-center">
                <div className='flex justify-center w-full'>
                  <Ellipsis />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAlunos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhum aluno encontrado
                </TableCell>
              </TableRow>
            ) : (
              paginatedAlunos.map((aluno) => (
                <TableRow key={aluno.id}>
                  <TableCell className='flex gap-2 items-center min-[1025px]:min-w-sm'>
                    <Avatar>
                      <AvatarImage src={aluno.image || "/avatar-placeholder.png"} />
                      <AvatarFallback>{aluno.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className='mt-1'>
                      {aluno.name}
                    </span>
                  </TableCell>
                  <TableCell className='min-[1025px]:min-w-sm'>{aluno.email}</TableCell>
                  <TableCell className='w-full'>{aluno.telefone}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={aluno.matriculado ? aluno.matriculado : false}
                      disabled={isPending}
                      onCheckedChange={(checked) => atualizarMatriculaAluno(aluno.id, checked)}
                    />
                  </TableCell>
                  <TableCell className='w-full max-w-[100px] min-w-[100px] font-semibold text-center'>
                    {aluno.avaliacoesComoAluno.length}
                  </TableCell>
                  <TableCell className='w-full max-w-[64px] min-w-[64px] font-semibold text-center'>
                    {calcularMedia(aluno.avaliacoesComoAluno)}
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
          {startIndex + 1} -{' '}
          {Math.min(endIndex, alunos.length)} de {alunos.length} resultados
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
};
