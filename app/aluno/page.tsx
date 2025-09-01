'use client';

import { useParams } from 'next/navigation';
import { students } from '@/lib/data';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Delete, Edit, Search } from 'lucide-react';
import { NavUsuario } from '@/components/nav-usuario';
import { ModalAvaliacao } from '@/components/modal-avaliação';

export default function AlunoDetalhesPage() {
  const params = useParams();
  const studentId = params.id as string;

  const student = students[0];

  if (!student) {
    return (
      <div className="container mx-auto p-4">
        <header className="bg-gray-200 p-4 mb-4">
          <h1 className="text-xl font-bold">Sistema de Notas de Redação</h1>
        </header>
        <h1>Aluno não encontrado</h1>
        <p>Nenhum aluno encontrado com o ID: {studentId}</p>
      </div>
    );
  }

  // Function to calculate total score
  const calculateTotalScore = (competencies: number[]) =>
    competencies.reduce((sum, score) => sum + score, 0);

  return (
    <div className="w-full">
      <div className='flex justify-between items-center h-14 p-5 mt-3 relative'>
        <div>
          <h1 className="text-lg font-bold">
            Olá! {' '}
            {student.name}
          </h1>

        </div>
        <NavUsuario />
      </div>
      <main className="flex flex-col gap-4 p-5">
        <div className='bg-card rounded-lg shadow-sm p-4 flex flex-col gap-4'>
          <div className="flex items-center w-full max-w-md relative">
            <Input type="text" placeholder="Buscar por Tema" className="bg-card/70 placeholder:text-xs" />
            <Button className='absolute right-0 top-0 bg-background border rounded-bl-none rounded-tl-none' variant='ghost'>
              <Search />
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow >
                <TableHead className='pl-4'>Tema</TableHead>
                <TableHead >Data</TableHead>
                <TableHead>Competência 1</TableHead>
                <TableHead>Competência 2</TableHead>
                <TableHead>Competência 3</TableHead>
                <TableHead>Competência 4</TableHead>
                <TableHead>Competência 5</TableHead>
                <TableHead>Nota Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {student.essays.map((essay) => (
                <ModalAvaliacao key={essay.id} essay={essay} />
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}