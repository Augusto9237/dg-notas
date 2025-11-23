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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';

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
    setCarregando(true)
    if (alunos.length > 0) {
      setListaAlunos(alunos)
    }
    setCarregando(false)
  }, [alunos]);


  return (
    <Card className='p-5'>
      <CardHeader className='flex w-full justify-between items-center p-0'>
        <div>
          <CardTitle >Melhores Desempenhos</CardTitle>
          <CardDescription className='text-sm mt-1'>Top 10 alunos com melhores médias</CardDescription>
        </div>

        <Link href="/professor/alunos" className='flex gap-1 items-center text-sm text-primary '>
          Ver todos
          <ChevronRight />
        </Link>
      </CardHeader>
      <Table >
        <TableHeader>
          <TableRow >
            <TableHead>Pos</TableHead>
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
                <TableCell className=' font-semibold w-[50px] text-center'>{aluno.posicao}º</TableCell>
                <TableCell className=' flex gap-4 items-center'>
                  <Avatar>
                    <AvatarImage src={aluno.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"} />
                    <AvatarFallback>{aluno.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {aluno.name}
                </TableCell>
                <TableCell>{aluno.email}</TableCell>
                <TableCell className="pr-5 font-semibold text-right">
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
