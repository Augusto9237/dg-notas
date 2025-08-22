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
    <div className="w-full max-w-screen-2xl mx-auto">
      <main className="p-4 flex flex-col gap-4">
        <h1 className=" text-xl font-bold">{student.name}</h1>
        <div className='flex gap-4 items-center'>
          <p className="text-muted-foreground">E-mail: email.test@test.com.br</p>
          <p className="text-muted-foreground">CPF: {student.id}</p>
          <FormularioAvaliacoa/>
        </div>
        <Table className='bg-card rounded-lg shadow-sm'>
          <TableHeader>
            <TableRow >
              <TableHead className='pl-4'>Tema</TableHead>
              <TableHead className='pl-4'>Data</TableHead>
              <TableHead>Competência 1</TableHead>
              <TableHead>Competência 2</TableHead>
              <TableHead>Competência 3</TableHead>
              <TableHead>Competência 4</TableHead>
              <TableHead>Competência 5</TableHead>
              <TableHead className="text-right">Nota Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {student.essays.map((essay) => (
              <TableRow key={essay.id}>
                <TableCell className='pl-4'>
                  {essay.title}
                </TableCell>
                <TableCell className='pl-4'>
                  {new Date().toLocaleDateString('pt-BR')}
                </TableCell>
                {essay.competencies.map((score, index) => (
                  <TableCell key={index}>{score}
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold">
                  {calculateTotalScore(essay.competencies)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  );
}