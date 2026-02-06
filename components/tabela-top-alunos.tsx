'use client'
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { AlunoRanking, rankearMelhoresAlunos } from '@/lib/dashboard-utils';
import { Prisma } from '@/app/generated/prisma';
import { useContext, useEffect, useState } from 'react';
import { ContextoProfessor } from '@/context/contexto-professor';
import { ListarAvaliacoes } from '@/actions/avaliacao';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

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
        const novasAvaliacoes = await ListarAvaliacoes(Number(mes), Number(ano), 1, 1000)
        const top10 = rankearMelhoresAlunos(novasAvaliacoes.data);
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
      <CardContent className='p-0 flex flex-col gap-4'>
        {alunos.map((aluno) => (
          <Link key={aluno.alunoId} href={`/professor/alunos/${aluno.alunoId}`}>
            <Card className='flex flex-row items-center p-4 gap-4'>
              <span className='text-lg font-bold'>{aluno.posicao}º</span>
              <Avatar className='size-10'>
                <Image alt={aluno.nome} src={aluno.image || "/avatar-placeholder.png"} height={40} width={40} />
                <AvatarFallback>{aluno.nome.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className='w-full flex flex-col gap-2'>
                <div className='flex w-full justify-between items-center -mt-1'>
                  <p className='pt-1 leading-none'>{aluno.nome}</p>
                  <Badge>{aluno.mediaFinal}</Badge>
                </div>
                <Progress value={(aluno.mediaFinal / 10)} />
              </div>
            </Card>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};
