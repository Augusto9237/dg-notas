'use client';
import { useState, useEffect, memo, useContext } from 'react';
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
import { Criterio, Tema, Prisma, User } from '@/app/generated/prisma';
import { DeletarAvaliacao, ListarAvaliacoesAlunoId } from '@/actions/avaliacao';
import { toast } from 'sonner';
import { DeleteButton } from './ui/delete-button';
import { Skeleton } from './ui/skeleton';
import { Ellipsis, FileDown, Trash } from 'lucide-react';
import { FormularioCorrecao } from './formulario-correcao';
import { storage } from '@/lib/firebase';
import { deleteObject, getDownloadURL, ref } from '@firebase/storage';
import { ContextoProfessor } from '@/context/contexto-professor';
import useDownloader from 'react-use-downloader';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';

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
  const [carregandoBusca, setCarregandoBusca] = useState(false)
  const [inicializado, setInicializado] = useState(false)
  const { download } = useDownloader();
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const busca = searchParams.get('busca') || ''
  const paginaAtual = Number(searchParams.get('page')) || 1

  useEffect(() => {
    if (avaliacoes) {
      setListaAvaliacoes(avaliacoes);
      setInicializado(true);
    }
  }, [avaliacoes]);

  useEffect(() => {
    let isMounted = true;

    const buscarAvaliacoes = async () => {
      // Se estivermos na primeira página e sem busca, usamos os dados da props (que já vieram do servidor)
      // Isso evita um fetch desnecessário na carga inicial
      if (paginaAtual === 1 && !busca) {
        setListaAvaliacoes(avaliacoes);
        return;
      }

      if (aluno.id) {
        setCarregandoBusca(true);
        const resultadoBusca = await ListarAvaliacoesAlunoId(aluno.id, busca, paginaAtual);

        if (isMounted) {
          setListaAvaliacoes(resultadoBusca);
          setCarregandoBusca(false);
        }
      }
    };

    buscarAvaliacoes();

    return () => {
      isMounted = false;
    };

  }, [busca, paginaAtual, aluno.id, avaliacoes])

  // Verificar se os dados são válidos
  if (!inicializado || carregandoBusca || !listaAvaliacoes || !listaAvaliacoes.data) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='pl-4 md:min-w-[360px]'>Tema</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>C1</TableHead>
            <TableHead>C2</TableHead>
            <TableHead>C3</TableHead>
            <TableHead>C4</TableHead>
            <TableHead>C5</TableHead>
            <TableHead>Nota Total</TableHead>
            <TableHead className="w-[100px] text-center pr-4">•••</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: avaliacoes.meta.total }).map((_, idx) => (
            <TableRow key={idx}>
              <TableCell colSpan={9} className="text-center">
                <Skeleton className='w-full h-8 rounded-sm' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  const { data: avaliacoesPaginadas, meta } = listaAvaliacoes;
  const totalPages = meta.totalPages;

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
      await DeletarAvaliacao(id)
      await deleteObject(storageRef);
      toast.error("Avaliaçao excluída")
    } catch (error) {
      console.log(error)
      toast.error('Algo deu errado, tente novamente!')
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
    <>
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
          {avaliacoesPaginadas.length === 0 ? (
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

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-gray-600 md:text-nowrap max-md:hidden">
            Página {paginaAtual} de {totalPages} ({avaliacoesPaginadas.length} resultados nesta página)
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePreviousPage}
                  className={paginaAtual <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(1, Math.min(paginaAtual - 2, totalPages - 4));
                return startPage + i;
              }).map((page) => (
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
      )}
    </>
  );
});
