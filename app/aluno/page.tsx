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
import Header from '@/components/ui/header';
import { CardAvaliacao } from '@/components/card-avaliacao';

export default function Page() {
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

  return (
    <div className="w-full">
      <main className="flex flex-col gap-4 p-5 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-primary font-semibold">Suas Redações</h2>
        
        </div>
        {student.essays.map((essay) => (
          <CardAvaliacao key={essay.id} essay={essay} />
        ))}
        {student.essays.map((essay) => (
          <CardAvaliacao key={essay.id} essay={essay} />
        ))}
        {student.essays.map((essay) => (
          <CardAvaliacao key={essay.id} essay={essay} />
        ))}
        {student.essays.map((essay) => (
          <CardAvaliacao key={essay.id} essay={essay} />
        ))}



        {/* <div className='bg-card rounded-lg shadow-sm p-4 flex flex-col gap-4'>
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
        </div> */}
      </main>
    </div>
  );
}