'use client';
import { useState, useEffect, memo } from 'react';
import { useSearchParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FormularioAvaliacao } from '@/components/formulario-avaliação';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from '@/components/ui/pagination';
import { Criterio, CriterioAvaliacao, Tema, Prisma, User } from '@/app/generated/prisma';
import { DeletarAvaliacao, ListarAvaliacoesAlunoId } from '@/actions/avaliacao';
import { toast } from 'sonner';
import { DeleteButton } from './ui/delete-button';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { Ellipsis, Trash } from 'lucide-react';
import { FormularioCorrecao } from './formulario-correcao';

type Avaliacao = Prisma.AvaliacaoGetPayload<{
  include: {
    aluno: true,
    criterios: true,
    tema: true,
  }
}>

interface TabelaAvaliacoesProps {
  aluno: User;
  temas: Tema[];
  criterios: Criterio[];
  avaliacoes: Avaliacao[];
}

export const TabelaAvaliacoes = memo(function TabelaAvaliacoes({ aluno, temas, criterios, avaliacoes }: TabelaAvaliacoesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [listaAvaliacoes, setListaAvaliacoes] = useState<TabelaAvaliacoesProps['avaliacoes']>(avaliacoes || []);
  const [carregando, setCarregando] = useState(false)

  const searchParams = useSearchParams()
  const busca = searchParams.get('busca')

  const pageSize = 10;

  useEffect(() => {
    if (avaliacoes && Array.isArray(avaliacoes)) {
      setListaAvaliacoes(avaliacoes);
    }
  }, [avaliacoes]);

  useEffect(() => {
    let isMounted = true;

    const buscarAvaliacoes = async () => {
      if (busca && aluno.id) {
        setCarregando(true);
        const resultadoBusca = await ListarAvaliacoesAlunoId(aluno.id, busca)

        if (isMounted) {
          setListaAvaliacoes(resultadoBusca as TabelaAvaliacoesProps['avaliacoes']);
          setCarregando(false);
        }
      }
    };

    buscarAvaliacoes()

    return () => {
      isMounted = false;
    };

  }, [busca])

  // Verificar se os dados são válidos
  if (carregando || !listaAvaliacoes || !Array.isArray(listaAvaliacoes)) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='pl-4 md:min-w-[360px]'>Tema</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>C1</TableHead>
            <TableHead>C2</TableHead>
            <TableHead>C3</TableHead>
            <TableHead>C4</TableHead>
            <TableHead>C5</TableHead>
            <TableHead>Nota Total</TableHead>
            <TableHead className="w-[100px] text-center pr-4">•••</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: pageSize }).map((_, idx) => (
            <TableRow key={idx}>
              <TableCell colSpan={9} className="text-center">
                <Skeleton className='w-full h-8 rounded-sm' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // Calcular paginação com base no state local
  const totalPages = Math.ceil(listaAvaliacoes.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAvaliacoes = listaAvaliacoes.slice(startIndex, endIndex);

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

  async function excluirAvaliacao(id: number) {
    try {
      await DeletarAvaliacao(id)
      toast.success("Avaliaçao excluída com sucesso")
    } catch (error) {
      console.log(error)
      toast.error('Algo deu errado, tente novamente!')
    }
  }


  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='min-[1025px]:min-w-lg'>Tema</TableHead>
            <TableHead className='min-[1025px]:min-w-[200px]'>Data</TableHead>
            <TableHead className='min-[1025px]:min-w-[32px] text-center'>C1</TableHead>
            <TableHead className='min-[1025px]:min-w-[32px] text-center'>C2</TableHead>
            <TableHead className='min-[1025px]:min-w-[32px] text-center'>C3</TableHead>
            <TableHead className='min-[1025px]:min-w-[32px] text-center'>C4</TableHead>
            <TableHead className='min-[1025px]:min-w-[32px] text-center'>C5</TableHead>
            <TableHead className='min-[1025px]:min-w-[32px] text-center'>Total</TableHead>
            <TableHead className="text-center">
              <div className='flex justify-center'>
                <Ellipsis />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedAvaliacoes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                Nenhuma avaliação encontrada
              </TableCell>
            </TableRow>
          ) : (
            paginatedAvaliacoes.map((avaliacao) => (
              <TableRow key={avaliacao.id}>
                <TableCell className='pl-4'>
                  {avaliacao.tema.nome}
                </TableCell>
                <TableCell>
                  {new Date(avaliacao.createdAt).toLocaleDateString('pt-BR')}
                </TableCell>
                {Array.from({ length: 5 }, (_, index) => {
                  const criterio = avaliacao.criterios[index];
                  return (
                    <TableCell key={criterio?.id || `empty-${index}`} className='text-center min-[1025px]:min-w-[32px]'>
                      {criterio?.pontuacao || 0}
                    </TableCell>
                  );
                })}
                <TableCell className="font-bold text-center">
                  {avaliacao.notaFinal}
                </TableCell>
                <TableCell className="w-[100px] pr-4">
                  <div className='flex justify-center gap-4'>
                    <FormularioCorrecao avaliacao={avaliacao} />

                    <DeleteButton onClick={() => excluirAvaliacao(avaliacao.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
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
      )}
    </>
  );
});
