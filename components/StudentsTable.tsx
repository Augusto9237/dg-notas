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

export function StudentsTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, pageSize: 10 });
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
    <div>
      <Table className='bg-card rounded-lg shadow-sm'>
        <TableHeader>
          <TableRow >
            <TableHead className='pl-4'>Nome</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center">
                Carregando...
              </TableCell>
            </TableRow>
          ) : students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center">
                Nenhum aluno encontrado.
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className='pl-4'>{student.name}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/alunos/${student.id}`} passHref>
                    <Button variant="outline" size="sm">
                      Ver Notas
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <div className="text-xs text-gray-600 md:text-nowrap">
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
              <PaginationNext
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}

              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default StudentsTable;