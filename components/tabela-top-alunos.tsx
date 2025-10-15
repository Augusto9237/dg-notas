'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
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
import { ChevronRight, FileCheck2, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle } from './ui/card';

interface AlunoRankeado {
  posicao: number;
  id: string;
  name: string;
  email: string;
  image: string | null; // Pode ser null
  mediaNotas: number;
  totalAvaliacoes: number;
}

interface TabelaAlunosProps {
  alunos: AlunoRankeado[]
}

export function TabelaTopAlunos({ alunos }: TabelaAlunosProps) {
  const [carregando, setCarregando] = useState(false)
  const [listaAlunos, setListaAlunos] = useState<AlunoRankeado[]>([])

  useEffect(() => {
    if (alunos.length > 0) {
      setListaAlunos(alunos)
    }
  }, [alunos]);


  return (
    <Card className='p-5'>
      <CardHeader className='flex w-full justify-between items-center p-0'>
        <CardTitle >Top 10 alunos</CardTitle>

        <Link href="/professor" className='flex gap-2 items-center text-sm text-primary '>
          Ver todos
          <ChevronRight />
        </Link>
      </CardHeader>
      <Table >
        <TableHeader>
          <TableRow >
            <TableHead>Rank</TableHead>
            <TableHead>Aluno</TableHead>
            <TableHead >E-mail</TableHead>
            <TableHead className="text-right">Média Geral</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listaAlunos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                Nenhum aluno encontrado
              </TableCell>
            </TableRow>
          ) : (
            listaAlunos.map((aluno) => (
              <TableRow key={aluno.id}>
                <TableCell className=' font-semibold'>{aluno.posicao}º</TableCell>
                <TableCell className=' flex gap-4 items-center'>
                  <Avatar>
                    <AvatarImage src={aluno.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"} />
                    <AvatarFallback>{aluno.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {aluno.name}
                </TableCell>
                <TableCell>{aluno.email}</TableCell>
                <TableCell className="text-right font-semibold">
                  {aluno.mediaNotas}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
