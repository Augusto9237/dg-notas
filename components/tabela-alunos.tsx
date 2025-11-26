'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
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
import { listarAlunosGoogle } from '@/actions/alunos';
import { useSearchParams } from 'next/navigation';
import { StatusAvaliacao } from '@/app/generated/prisma';
import { calcularMedia } from '@/lib/media-geral';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { banirUsuario } from '@/actions/admin';
import { toast } from 'sonner';
import { DeleteButton } from './ui/delete-button';



interface TabelaAlunosProps {
  alunos: ({
    Avaliacao: {
      id: number;
      createdAt: Date;
      updatedAt: Date;
      alunoId: string;
      temaId: number;
      notaFinal: number;
      status: StatusAvaliacao;
      resposta: string;
    }[];
  } & {
    Avaliacao: {
      id: number;
      createdAt: Date;
      updatedAt: Date;
      alunoId: string;
      temaId: number;
      notaFinal: number;
      status: StatusAvaliacao;
      resposta: string;
      correcao: string | null;
    }[];
    name: string;
    id: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    role: string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | null;
  })[]
}

export function TabelaAlunos({ alunos }: TabelaAlunosProps) {
  const [carregando, setCarregando] = useState(false)
  const [listaAlunos, setListaAlunos] = useState<TabelaAlunosProps['alunos']>([])
  const searchParams = useSearchParams()
  const busca = searchParams.get('busca')

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setCarregando(true);
    if (alunos.length > 0) {
      setListaAlunos(alunos)
    }
    setCarregando(false);
  }, [alunos]);

  useEffect(() => {
    let isMounted = true;

    const buscarAvaliacoes = async () => {
      if (busca) {
        setCarregando(true);
        const resultadoBusca = await listarAlunosGoogle(busca)

        if (isMounted) {
          setListaAlunos(resultadoBusca);
          setCarregando(false);
        }
      }
    };

    buscarAvaliacoes()

    return () => {
      isMounted = false;
    };

  }, [busca])

  async function excluirAluno(alundoId: string) {
    try {
      const resposta = await banirUsuario(alundoId)
      toast.error(resposta.message)
    } catch (error) {
      console.log(error)
    }
  }

  // Calcular paginação
  const totalPages = Math.ceil(listaAlunos.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAlunos = listaAlunos.slice(startIndex, endIndex);



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
    <div className='bg-card rounded-lg shadow-sm p-5 flex flex-col gap-4'>
      <div className="flex items-center max-w-md relative">
        <InputBusca
          placeholder='Buscar por E-mail'
        />
      </div>
      <Table >
        <TableHeader>
          <TableRow >
            <TableHead className='min-w-sm'>Aluno</TableHead>
            <TableHead className='sm:w-full' >E-mail</TableHead>
            <TableHead className='w-full max-w-[120px] min-w-[120px] font-semibold'>Avaliações</TableHead>
            <TableHead className='w-full max-w-[120px] min-w-[120px] font-semibold'>Média Geral</TableHead>
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
                <TableCell className='flex gap-2 items-center min-w-sm'>
                  <Avatar>
                    <AvatarImage src={aluno.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"} />
                    <AvatarFallback>{aluno.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className='mt-1'>
                    {aluno.name}
                  </span>
                </TableCell>
                <TableCell>{aluno.email}</TableCell>
                <TableCell className='w-full max-w-[120px] min-w-[120px] text-center font-semibold'>
                  {aluno.Avaliacao.length}
                </TableCell>
                <TableCell className='w-full max-w-[120px] min-w-[120px] text-center font-semibold'>{calcularMedia(aluno.Avaliacao)}</TableCell>
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
      <div className="flex justify-between items-center mt-4">
        <div className="text-xs text-gray-600 md:text-nowrap max-md:hidden">
          {startIndex + 1} -{' '}
          {Math.min(endIndex, listaAlunos.length)} de {listaAlunos.length} resultados
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
