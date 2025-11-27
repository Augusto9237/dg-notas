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
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

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
    <Card className='p-5 gap-5'>
      <CardHeader className='flex w-full justify-between items-center p-0'>
        <CardTitle >Melhores Desempenhos</CardTitle>
        <Link href="/professor/alunos" className='flex  items-center text-sm text-primary '>
          <p className='leading-relaxed max-sm:hidden'>Ver todos</p>
          <p className='sm:hidden'>Todos</p>
          <ChevronRight />
        </Link>
      </CardHeader>
      <Table >
        <TableHeader>
          <TableRow >
            <TableHead>Pos</TableHead>
            <TableHead>Aluno</TableHead>
            <TableHead className='w-[46px]'>Média</TableHead>
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
                <TableCell className='font-semibold w-[46px] text-center'>{aluno.posicao}º</TableCell>
                <TableCell colSpan={2}>
                  <div className='flex gap-2 items-center w-full'>
                    <Avatar>
                      <AvatarImage src={aluno.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"} />
                      <AvatarFallback>{aluno.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className='w-full flex flex-col gap-1'>
                      <div className='flex w-full justify-between items-center -mt-1'>
                        <p className='leading-0'>{aluno.name}</p>
                        <Badge>{aluno.mediaNotas}</Badge>
                      </div>
                      <Progress value={(aluno.mediaNotas / 10) * 100}/>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
