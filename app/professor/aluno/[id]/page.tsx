import { students } from '@/lib/data';

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
import { Delete, Edit, Search } from 'lucide-react';
import { DeleteButton } from '@/components/ui/delete-button';
import { EditButton } from '@/components/ui/edit-button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ListarAvaliacoesAlunoId, ListarCriterios, ListarTemas } from '@/actions/avaliacao';
import { Prisma } from '@/app/generated/prisma';
import { prisma } from '@/lib/prisma';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const studentId = "cSdMhVS7NKrkwx6D6ogDtEakwomeS02t"
  const student = students.find((s) => s.id === studentId);

  const temas = await ListarTemas()
  const criterios = await ListarCriterios()
  const avaliacoes = await ListarAvaliacoesAlunoId(studentId)


  return (
    <div className="w-full">
      <div className='flex justify-between items-center h-14 p-5 mt-3 relative'>
        <SidebarTrigger className='md:hidden absolute' />
        <div className='max-md:ml-10'>
          <h1 className=" text-xl font-bold">
            test</h1>
          <p className="text-xs text-muted-foreground">email.test@test.com.br - 00.000.000-00</p>
        </div>
        <FormularioAvaliacao alunoId={studentId} temas={temas} criterios={criterios} />
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
              {avaliacoes.map((avaliacao) => (
                <TableRow key={avaliacao.id}>
                  <TableCell className='pl-4'>
                    {avaliacao.tema.nome}
                  </TableCell>
                  <TableCell>
                    {new Date().toLocaleDateString('pt-BR')}
                  </TableCell>
                  {avaliacao.criterios.map((criterio) => (
                    <TableCell key={criterio.id}>{criterio.pontuacao}
                    </TableCell>
                  ))}
                  <TableCell className="font-bold">
                    {avaliacao.notaFinal}
                  </TableCell>
                  <TableCell className="w-[100px] pr-4">
                    <div className='flex justify-center gap-4'>
                      <FormularioAvaliacao alunoId={studentId} temas={temas} criterios={criterios} avaliacao={avaliacao}/>
                      {/* <EditButton onClick={() => alert(`Editar avaliação ${essay.id}`)} />
                      <DeleteButton onClick={() => alert(`Excluir avaliação ${essay.id}`)} /> */}
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