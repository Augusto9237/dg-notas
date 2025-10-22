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
import { Ellipsis, FileCheck2, Search } from 'lucide-react';
import { InputBusca } from './input-busca';
import { ListarAlunosGoogle } from '@/actions/alunos';
import { useSearchParams } from 'next/navigation';
import { Avaliacao, Prisma } from '@/app/generated/prisma';
import { calcularMedia } from '@/lib/media-geral';

type AvaliacaoTema = Prisma.AvaliacaoGetPayload<{
  include: {
    aluno: true,
    criterios: true,
    tema: true,
  }
}>

interface TabelaAvaliacoesTemaProps {
  avaliacoes: AvaliacaoTema[]
}

export function TabelaAvaliacoesTema({ avaliacoes }: TabelaAvaliacoesTemaProps) {
  const [carregando, setCarregando] = useState(false)
  const [listaAvaliacoes, setListaAvaliacoes] = useState<TabelaAvaliacoesTemaProps['avaliacoes']>([])
  const searchParams = useSearchParams()
  const busca = searchParams.get('busca')

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setCarregando(true);
    if (avaliacoes.length > 0) {
      setListaAvaliacoes(avaliacoes)
    }
    setCarregando(false);
  }, [avaliacoes]);

  // useEffect(() => {
  //   let isMounted = true;

  //   const buscarAvaliacoes = async () => {
  //     if (busca) {
  //       setCarregando(true);
  //       const resultadoBusca = await ListarAlunosGoogle(busca)

  //       if (isMounted) {
  //         setListaAvaliacoes(resultadoBusca);
  //         setCarregando(false);
  //       }
  //     }
  //   };

  //   buscarAvaliacoes()

  //   return () => {
  //     isMounted = false;
  //   };

  // }, [busca])

  // Calcular paginação
  const totalPages = Math.ceil(listaAvaliacoes.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginacaoAvaliacoes = listaAvaliacoes.slice(startIndex, endIndex);



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
            <TableHead>Aluno</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Competência 1</TableHead>
            <TableHead>Competência 2</TableHead>
            <TableHead>Competência 3</TableHead>
            <TableHead>Competência 4</TableHead>
            <TableHead>Competência 5</TableHead>
            <TableHead>Nota Total</TableHead>
            <TableHead className="text-center">
              <div className='flex justify-center w-full'>
                <Ellipsis />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginacaoAvaliacoes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                Nenhum aluno encontrado
              </TableCell>
            </TableRow>
          ) : (
            paginacaoAvaliacoes.map((avaliacao) => (
              <TableRow key={avaliacao.id}>
                <TableCell className='flex gap-2 items-center min-w-sm'>
                  <Avatar>
                    <AvatarImage src={avaliacao.aluno.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"} />
                    <AvatarFallback>{avaliacao.aluno.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className='mt-1'>
                    {avaliacao.aluno.name}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(avaliacao.createdAt).toLocaleDateString('pt-BR')}
                </TableCell>
                {avaliacao.criterios.map((criterio) => (
                  <TableCell key={criterio.id} className='text-center'>
                    {criterio.pontuacao}
                  </TableCell>
                ))}
                <TableCell className='w-full max-w-[120px] min-w-[120px] text-center font-semibold'>{avaliacao.notaFinal}</TableCell>
                <TableCell className="text-center">
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <div className="text-xs text-gray-600 md:text-nowrap max-md:hidden">
          {startIndex + 1} -{' '}
          {Math.min(endIndex, listaAvaliacoes.length)} de {listaAvaliacoes.length} resultados
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
