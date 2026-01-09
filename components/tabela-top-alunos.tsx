'use client'
import Link from 'next/link';
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
import { Card, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { AlunoRanking, rankearMelhoresAlunos } from '@/lib/dashboard-utils';
import { Prisma } from '@/app/generated/prisma';
import { useContext, useEffect, useState } from 'react';
import { ContextoProfessor } from '@/context/contexto-professor';
import { ListarAvaliacoes } from '@/actions/avaliacao';
import { useSearchParams } from 'next/navigation';

type Avaliacao = Prisma.AvaliacaoGetPayload<{
  include: {
    aluno: true,
    criterios: true,
    tema: true,
  }
}>


interface TabelaAlunosProps {
  avaliacoes: Avaliacao[]
}

export function TabelaTopAlunos({ avaliacoes }: TabelaAlunosProps) {
  const { notificacoes } = useContext(ContextoProfessor)
  const [alunos, setAlunos] = useState<AlunoRanking[]>([])

  const params = useSearchParams();
  const mes = params.get('mes');
  const ano = params.get('ano')

  useEffect(() => {
    const top10 = rankearMelhoresAlunos(avaliacoes);
    setAlunos(top10)
  }, [avaliacoes])

  useEffect(() => {
    const handleNotification = async () => {
      if (!notificacoes?.data?.url) return;
      const url = notificacoes.data.url;

      if (url === '/professor/avaliacoes') {
        const novasAvaliacoes = await ListarAvaliacoes(Number(mes), Number(ano))
        const top10 = rankearMelhoresAlunos(novasAvaliacoes);
        setAlunos(top10)
      }
    }

    handleNotification();
  }, [notificacoes])

  return (
    <Card className='p-5 gap-5'>
      <CardHeader className='flex w-full justify-between items-start p-0'>
        <CardTitle >Melhores Desempenhos</CardTitle>
        <Link href="/professor/alunos" className='flex  items-center text-sm text-primary '>
          <p className='leading-relaxed max-sm:hidden'>Ver todos</p>
          <p className='sm:hidden'>Todos</p>
          <ChevronRight className="max-sm:size-[16px] size-[20px]" />
        </Link>
      </CardHeader>
      <Table >
        <TableHeader>
          <TableRow >
            <TableHead className='w-[46px]'>Pos</TableHead>
            <TableHead>Aluno</TableHead>
            <TableHead className='w-[46px]'>Média</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alunos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                Nenhum ranking encontrado para este mês
              </TableCell>
            </TableRow>
          ) : (
            alunos.map((aluno) => (
              <TableRow key={aluno.alunoId}>
                <TableCell className='font-semibold w-[46px] text-center text-xl'>{aluno.posicao}º</TableCell>
                <TableCell colSpan={2}>
                  <div className='flex gap-2 items-center w-full'>
                    <Avatar className='size-10'>
                      <AvatarImage src={aluno.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"} />
                      <AvatarFallback>{aluno.nome.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className='w-full flex flex-col gap-2'>
                      <div className='flex w-full justify-between items-center -mt-1'>
                        <p className='pt-1 leading-none'>{aluno.nome}</p>
                        <Badge>{aluno.mediaFinal}</Badge>
                      </div>
                      <Progress value={(aluno.mediaFinal / 10)} />
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
