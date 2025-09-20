'use client';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FormularioAvaliacao } from '@/components/formulario-avaliação';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from '@/components/ui/pagination';
import { Criterio, CriterioAvaliacao, Tema, Avaliacao } from '@/app/generated/prisma';
import { DeletarAvaliacao } from '@/actions/avaliacao';
import { toast } from 'sonner';
import { DeleteButton } from './ui/delete-button';

interface Aluno {
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
}

interface TabelaAvaliacoesProps {
  aluno: Aluno;
  temas: Tema[];
  criterios: Criterio[];
  avaliacoes: (Avaliacao & {
    tema: Tema;
    criterios: CriterioAvaliacao[];
  })[];
}

export function TabelaAvaliacoes({ aluno, temas, criterios, avaliacoes }: TabelaAvaliacoesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtrar avaliações baseado no termo de busca
  const filteredAvaliacoes = useMemo(() => {
    if (!searchTerm) return avaliacoes;
    return avaliacoes.filter(avaliacao =>
      avaliacao.tema.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [avaliacoes, searchTerm]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredAvaliacoes.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAvaliacoes = filteredAvaliacoes.slice(startIndex, endIndex);

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
            <TableHead className='pl-4 md:min-w-[360px]'>Tema</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Competência 1</TableHead>
            <TableHead>Competência 2</TableHead>
            <TableHead>Competência 3</TableHead>
            <TableHead>Competência 4</TableHead>
            <TableHead>Competência 5</TableHead>
            <TableHead>Nota Total</TableHead>
            <TableHead className="w-[100px] text-center pr-4">•••</TableHead>
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
                    <TableCell key={criterio?.id || `empty-${index}`}>
                      {criterio?.pontuacao || 0}
                    </TableCell>
                  );
                })}
                <TableCell className="font-bold">
                  {avaliacao.notaFinal}
                </TableCell>
                <TableCell className="w-[100px] pr-4">
                  <div className='flex justify-center gap-4'>
                    <FormularioAvaliacao
                      alunoId={aluno.id}
                      temas={temas}
                      criterios={criterios}
                      avaliacao={avaliacao}
                    />
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
            {Math.min(endIndex, filteredAvaliacoes.length)} de {filteredAvaliacoes.length} resultados
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
}
