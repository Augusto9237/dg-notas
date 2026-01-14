'use client';

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
import { Ellipsis, FileDown } from 'lucide-react';
import { InputBusca } from './input-busca';
import { useSearchParams } from 'next/navigation';
import { Prisma } from '@/app/generated/prisma';
import { FormularioCorrecao } from './formulario-correcao';
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import useDownloader from "react-use-downloader";
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { toast } from 'sonner';
import { DeleteButton } from './ui/delete-button';
import { DeletarAvaliacao } from '@/actions/avaliacao';

type AvaliacaoTema = Prisma.AvaliacaoGetPayload<{
  include: {
    aluno: true,
    criterios: true,
    tema: true,
  }
}>

interface TabelaAvaliacoesTemaProps {
  avaliacoes: AvaliacaoTema[]
}

export function TabelaAvaliacoesTema({ avaliacoes }: TabelaAvaliacoesTemaProps) {
  const [carregando, setCarregando] = useState(false)
  const [listaAvaliacoes, setListaAvaliacoes] = useState<TabelaAvaliacoesTemaProps['avaliacoes']>([])
  const searchParams = useSearchParams()
  const busca = searchParams.get('busca')
  const { download } = useDownloader();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setCarregando(true);
    if (avaliacoes.length > 0) {
      setListaAvaliacoes(avaliacoes)
    }
    setCarregando(false);
  }, [avaliacoes]);

  useEffect(() => {
    let isMounted = true;

    const buscarAvaliacoes = async () => {
      if (busca) {
        setCarregando(true);
        const resultadoBusca = avaliacoes.filter((avaliacao) => avaliacao.aluno.email.toLowerCase().includes(busca.toLowerCase()));

        if (isMounted) {
          setListaAvaliacoes(resultadoBusca);
          setCarregando(false);
        }
      }
    };

    buscarAvaliacoes()

    return () => {
      isMounted = false;
    };

  }, [busca])

  // Calcular paginação
  const totalPages = Math.ceil(listaAvaliacoes.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginacaoAvaliacoes = listaAvaliacoes.slice(startIndex, endIndex);



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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

  async function excluirAvaliacao(avaliacaoId: number, path: string) {
    const arquivo = ref(storage, path);
    try {
      await DeletarAvaliacao(avaliacaoId);
      const deletarArquivo = await deleteObject(arquivo);
      setListaAvaliacoes(prevAvaliacoes => prevAvaliacoes.filter(avaliacao => avaliacao.id !== avaliacaoId));
      toast.success('Avaliação excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir a avaliação:', error);
      toast.error('Erro ao excluir a avaliação. Tente novamente.');
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
        <Table className='h-full'>
          <TableHeader>
            <TableRow >
              <TableHead className='min-[1025px]:min-w-sm'>Aluno</TableHead>
              <TableHead className='min-[1025px]:min-w-sm'>E-mail</TableHead>
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
            {paginacaoAvaliacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhum aluno encontrado
                </TableCell>
              </TableRow>
            ) : (
              paginacaoAvaliacoes.map((avaliacao) => (
                <TableRow key={avaliacao.id}>
                  <TableCell className='flex gap-2 items-center md:max-w-sm'>
                    <Avatar>
                      <AvatarImage src={avaliacao.aluno.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"} />
                      <AvatarFallback>{avaliacao.aluno.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <p className='mt-1'>
                      {avaliacao.aluno.name}
                    </p>
                  </TableCell>
                  <TableCell className='md:max-w-sm'>{avaliacao.aluno.email}</TableCell>
                  <TableCell>
                    {new Date(avaliacao.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  {avaliacao.criterios.length === 0 ? (
                    <>
                      <TableCell className='text-center w-[100px]'>0</TableCell>
                      <TableCell className='text-center w-[100px]'>0</TableCell>
                      <TableCell className='text-center w-[100px]'>0</TableCell>
                      <TableCell className='text-center w-[100px]'>0</TableCell>
                      <TableCell className='text-center w-[100px]'>0</TableCell>
                    </>
                  ) : (
                    <>
                      {avaliacao.criterios.map((criterio) => (
                        <TableCell key={criterio.id} className='text-center'>
                          {criterio.pontuacao}
                        </TableCell>
                      ))}
                    </>
                  )
                  }
                  <TableCell className="text-center font-semibold w-full min-w-[68px] max-w-[68px]">
                    {avaliacao.notaFinal.toFixed(2).replace('.', ',')}
                  </TableCell>
                  <TableCell className="w-[100px]">
                    <div className="flex gap-4 justify-center">
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

                      <DeleteButton onClick={() => excluirAvaliacao(avaliacao.id, avaliacao.resposta)} />
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
          {Math.min(endIndex, listaAvaliacoes.length)} de {listaAvaliacoes.length} resultados
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
