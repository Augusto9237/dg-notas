'use client';
import { useState, useEffect, memo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from '@/components/ui/pagination';
import { Prisma, User } from '@/app/generated/prisma';
import { DeletarAvaliacao, ListarAvaliacoesAlunoId } from '@/actions/avaliacao';
import { toast } from 'sonner';
import { DeleteButton } from './ui/delete-button';
import { Skeleton } from './ui/skeleton';
import { Ellipsis, FileDown } from 'lucide-react';
import { FormularioCorrecao } from './formulario-correcao';
import { storage } from '@/lib/firebase';
import { deleteObject, getDownloadURL, ref } from '@firebase/storage';
import useDownloader from 'react-use-downloader';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { InputBusca } from './input-busca';

type Avaliacao = Prisma.AvaliacaoGetPayload<{
  include: {
    aluno: true,
    criterios: true,
    tema: true,
  }
}>

interface TabelaAvaliacoesProps {
  aluno: User;
  avaliacoes: {
    data: Avaliacao[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const TabelaAvaliacoes = memo(function TabelaAvaliacoes({ aluno, avaliacoes }: TabelaAvaliacoesProps) {
  const [listaAvaliacoes, setListaAvaliacoes] = useState<TabelaAvaliacoesProps['avaliacoes']>(avaliacoes || { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
  const [carregandoBusca, setCarregandoBusca] = useState(false);
  const { download } = useDownloader();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const busca = searchParams.get('busca') || '';
  const paginaAtual = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    setListaAvaliacoes(avaliacoes);
  }, [avaliacoes]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const buscarAvaliacoes = async () => {
      if (paginaAtual === 1 && !busca) {
        setListaAvaliacoes(avaliacoes);
        return;
      }

      if (aluno.id) {
        setCarregandoBusca(true);
        try {
          const resultadoBusca = await ListarAvaliacoesAlunoId(aluno.id, busca, paginaAtual);
          if (isMounted) {
            setListaAvaliacoes(resultadoBusca);
          }
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            console.error(error);
          }
        } finally {
          if (isMounted) {
            setCarregandoBusca(false);
          }
        }
      }
    };

    buscarAvaliacoes();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [busca, paginaAtual, aluno.id, avaliacoes]);

  const { data: avaliacoesPaginadas, meta } = listaAvaliacoes;
  const totalPages = meta.totalPages;
  const startIndex = (paginaAtual - 1) * meta.limit;
  const endIndex = startIndex + avaliacoesPaginadas.length;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePreviousPage = () => {
    if (paginaAtual > 1) {
      handlePageChange(paginaAtual - 1);
    }
  };

  const handleNextPage = () => {
    if (paginaAtual < totalPages) {
      handlePageChange(paginaAtual + 1);
    }
  };

  async function excluirAvaliacao(id: number, temaId: number, alunoEmail: string) {
    const storageRef = ref(storage, `avaliacoes/${temaId}/${alunoEmail}`);
    try {
      await DeletarAvaliacao(id);
      await deleteObject(storageRef);
      toast.success("Avaliação excluída");
      // Refresh the list
      const newAvaliacoes = await ListarAvaliacoesAlunoId(aluno.id, busca, paginaAtual);
      setListaAvaliacoes(newAvaliacoes);
    } catch (error) {
      console.log(error);
      toast.error('Algo deu errado, tente novamente!');
    }
  }

  async function baixarArquivo(path: string, emailAluno: string) {
    try {
      const arquivo = ref(storage, path);
      const url = await getDownloadURL(arquivo);

      download(url, `${emailAluno}.jpg`);
      toast.success('Download iniciado!');
    } catch (error) {
      console.error('Erro ao baixar o arquivo:', error);
      toast.error('Erro ao baixar o arquivo. Tente novamente.');
    }
  }

  return (
    <div className='bg-card rounded-lg shadow-sm p-5 flex flex-col gap-4 h-full min-h-full'>
      <div className="flex items-center max-w-md relative">
        <InputBusca
          placeholder='Buscar por E-mail'
        />
      </div>

      <div className='w-full h-full flex-1'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='min-[1025px]:min-w-lg'>Tema</TableHead>
              <TableHead className='min-[1025px]:min-w-[200px]'>Data</TableHead>
              <TableHead className='min-[1025px]:min-w-[32px] text-center'>C1</TableHead>
              <TableHead className='min-[1025px]:min-w-[32px] text-center'>C2</TableHead>
              <TableHead className='min-[1025px]:min-w-[32px] text-center'>C3</TableHead>
              <TableHead className='min-[1025px]:min-w-[32px] text-center'>C4</TableHead>
              <TableHead className='min-[1025px]:min-w-[32px] text-center'>C5</TableHead>
              <TableHead className='min-[1025px]:min-w-[32px] text-center'>Total</TableHead>
              <TableHead className="text-center">
                <div className='flex justify-center'>
                  <Ellipsis />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carregandoBusca ? (
              Array.from({ length: meta.limit || 10 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell colSpan={9} className="text-center">
                    <Skeleton className='w-full h-8 rounded-sm' />
                  </TableCell>
                </TableRow>
              ))
            ) : avaliacoesPaginadas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Nenhuma avaliação encontrada
                </TableCell>
              </TableRow>
            ) : (
              avaliacoesPaginadas.map((avaliacao) => (
                <TableRow key={avaliacao.id}>
                  <TableCell className='pl-4'>
                    {avaliacao.tema.nome}
                  </TableCell>
                  <TableCell>
                    {new Date(avaliacao.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  {Array.from({ length: 5 }, (_, index) => {
                    const criterio = avaliacao.criterios[index];
                    return (
                      <TableCell key={criterio?.id || `empty-${index}`} className='text-center min-[1025px]:min-w-[32px]'>
                        {criterio?.pontuacao || 0}
                      </TableCell>
                    );
                  })}
                  <TableCell className="font-bold text-center">
                    {avaliacao.notaFinal}
                  </TableCell>
                  <TableCell className="w-[100px] pr-4">
                    <div className='flex justify-center gap-4'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant='outline' onClick={() => baixarArquivo(avaliacao.resposta, avaliacao.aluno.email)}>
                            <FileDown />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-primary bg-background fill-background">
                          <p>Baixar Redação</p>
                        </TooltipContent>
                      </Tooltip>

                      <FormularioCorrecao avaliacao={avaliacao} />

                      <DeleteButton onClick={() => excluirAvaliacao(avaliacao.id, avaliacao.temaId, avaliacao.aluno.email)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="text-xs text-gray-600 md:text-nowrap max-md:hidden">
          {startIndex + 1} -{' '}
          {Math.min(endIndex, listaAvaliacoes.data.length)} de {listaAvaliacoes.meta.total} resultados
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                className={paginaAtual <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === paginaAtual}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
                className={paginaAtual >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div >
  );
});
