'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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

interface Student {
  id: string;
  name: string;
}

interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
}

interface FetchStudentsResponse {
  students: Student[];
  pagination: PaginationData;
}

// Assume this function exists and fetches data with pagination
async function fetchStudents(page: number, pageSize: number): Promise<FetchStudentsResponse> {
  // This is a placeholder. Replace with actual data fetching logic.
  const dummyStudents: Student[] = Array.from({ length: 50 }, (_, i) => ({
    id: `student-${i + 1}`,
    name: `Aluno ${i + 1}`,
  }));

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedStudents = dummyStudents.slice(start, end);

  return {
    students: paginatedStudents,
    pagination: {
      total: dummyStudents.length,
      page: page,
      pageSize: pageSize,
    },
  };
}

export function TabelaAlunos() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, pageSize: 12 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      const data = await fetchStudents(pagination.page, pagination.pageSize);
      setStudents(data.students);
      setPagination(data.pagination);
      setLoading(false);
    };
    loadStudents();
  }, [pagination.page, pagination.pageSize]);

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div className='bg-card rounded-lg shadow-sm p-4 flex flex-col gap-4'>
      <div className="flex items-center max-w-md relative">
        <Input type="text" placeholder="Buscar por nome..." className="bg-card/70" />
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
          {loading ? (
            Array.from({ length: 12 }, (_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={4}>
                  <Skeleton className="h-9 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : students.length === 0 ? (
            Array.from({ length: 4 }, (_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={12}>
                  <Skeleton className="h-9 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className='pl-4 flex gap-4 items-center'>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  {student.name}
                </TableCell>
                <TableCell>Email.test@teste.com</TableCell>
                <TableCell>00.000.000-00</TableCell>
                <TableCell className="text-right">
                  <Link href={`/professor/aluno/${student.id}`} passHref>
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
          {(pagination.page - 1) * pagination.pageSize + 1} -{' '}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} resultados
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}

              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setPagination({ ...pagination, page })}
                  isActive={page === pagination.page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              {pagination.page >= totalPages ? null : (
                <PaginationNext
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
