'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
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
import { Input } from './ui/input';
import { FileCheck2, Search } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

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

interface TabelaAlunosProps {
  alunos: Aluno[]
}

export function TabelaAlunos({ alunos }: TabelaAlunosProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filtrar alunos baseado no termo de busca
  const filteredAlunos = useMemo(() => {
    if (!searchTerm) return alunos;
    return alunos.filter(aluno => 
      aluno.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [alunos, searchTerm]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredAlunos.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAlunos = filteredAlunos.slice(startIndex, endIndex);

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
    <div className='bg-card rounded-lg shadow-sm p-4 flex flex-col gap-4'>
      <div className="flex items-center max-w-md relative">
        <Input 
          type="text" 
          placeholder="Buscar por Nome" 
          className="bg-card/70" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button className='absolute right-0 top-0 text-primary border rounded-bl-none rounded-tl-none' variant='ghost'>
          <Search />
        </Button>
      </div>
      <Table >
        <TableHeader>
          <TableRow >
            <TableHead className='pl-4'>Aluno</TableHead>
            <TableHead >E-mail</TableHead>
            <TableHead >CPF</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedAlunos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                Nenhum aluno encontrado
              </TableCell>
            </TableRow>
          ) : (
            paginatedAlunos.map((aluno) => (
              <TableRow key={aluno.id}>
                <TableCell className='pl-4 flex gap-4 items-center'>
                  <Avatar>
                    <AvatarImage src={aluno.image || "https://github.com/shadcn.png"} />
                    <AvatarFallback>{aluno.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {aluno.name}
                </TableCell>
                <TableCell>{aluno.email}</TableCell>
                <TableCell>00.000.000-00</TableCell>
                <TableCell className="text-right">
                  <Link href={`/professor/aluno/${aluno.id}`} passHref>
                    <Button>
                      <FileCheck2 />
                      Notas
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <div className="text-xs text-gray-600 md:text-nowrap max-md:hidden">
          {startIndex + 1} -{' '}
          {Math.min(endIndex, filteredAlunos.length)} de {filteredAlunos.length} resultados
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
