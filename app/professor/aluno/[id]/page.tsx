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
import { FormularioAvaliacoa } from '@/components/formulario-avaliação';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Delete, Edit, Search } from 'lucide-react';
import { DeleteButton } from '@/components/ui/delete-button';
import { EditButton } from '@/components/ui/edit-button';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function AlunoDetalhesPage() {
  const params = useParams();
  const studentId = params.id as string;

  const student = students.find((s) => s.id === studentId);

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
        <SidebarTrigger className='md:hidden absolute' />
        <div className='max-md:ml-10'>
          <h1 className=" text-xl font-bold">
            {student.name}</h1>
          <p className="text-xs text-muted-foreground">email.test@test.com.br - 00.000.000-00</p>
        </div>
        <FormularioAvaliacoa />
      </div>
      <main className="flex flex-col gap-4 p-5">
        <div className='bg-card rounded-lg shadow-sm p-4 flex flex-col gap-4'>
          <div className="flex items-center w-full max-w-md relative">
            <Input type="text" placeholder="Buscar por Tema" className="bg-card/70" />
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
                <TableHead className="w-[100px] text-center pr-4">•••</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {student.essays.map((essay) => (
                <TableRow key={essay.id}>
                  <TableCell className='pl-4'>
                    {essay.title}
                  </TableCell>
                  <TableCell>
                    {new Date().toLocaleDateString('pt-BR')}
                  </TableCell>
                  {essay.competencies.map((score, index) => (
                    <TableCell key={index}>{score}
                    </TableCell>
                  ))}
                  <TableCell className="font-bold">
                    {calculateTotalScore(essay.competencies)}
                  </TableCell>
                  <TableCell className="w-[100px] pr-4">
                    <div className='flex justify-center gap-4'>
                      <EditButton onClick={() => alert(`Editar avaliação ${essay.id}`)} />
                      <DeleteButton onClick={() => alert(`Excluir avaliação ${essay.id}`)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}