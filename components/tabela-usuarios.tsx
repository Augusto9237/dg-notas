'use client';

import { useState, useTransition } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Ellipsis, ShieldCheck } from 'lucide-react';
import { InputBusca } from './input-busca';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Prisma } from '@/app/generated/prisma';
import { toast } from 'sonner';
import { DeleteButton } from './ui/delete-button';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';
import { removerUsuario } from '@/actions/admin';

type Professor = Prisma.UserGetPayload<{}>

interface TabelaUsuariosProps {
  initialData: {
    data: Professor[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }
}

export function TabelaUsuarios({ initialData }: TabelaUsuariosProps) {
  const [isPending, startTransition] = useTransition()

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const paginaAtual = Number(searchParams.get('page')) || 1
  const isLoading = isPending;

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      params.set('page', newPage.toString())
      router.push(`${pathname}?${params.toString()}`)
    })
  };

  const handlePreviousPage = () => {
    if (paginaAtual > 1) {
      handlePageChange(paginaAtual - 1)
    }
  };

  const handleNextPage = () => {
    if (paginaAtual < initialData.totalPaginas) {
      handlePageChange(paginaAtual + 1)
    }
  };

  async function handleExcluir(id: string) {
    try {
      const resp = await removerUsuario(id)
      if (resp.success) {
        toast.success(resp.message)
      }
    } catch (error) {
      toast.error("Erro ao remover usuário")
    }
  }

  return (
    <div className='bg-card rounded-lg shadow-sm p-5 flex flex-col gap-4 h-full flex-1 justify-beetwen w-full overflow-hidden'>
      <div className="flex items-center justify-between gap-4 w-full relative">
        <div className="flex-1 max-w-md">
          <InputBusca
            placeholder='Buscar por E-mail'
          />
        </div>
      </div>

      <div className='h-full flex-1 oveflow-hidden'>
        <Table className='h-full'>
          <TableHeader>
            <TableRow >
              <TableHead >Usuário</TableHead>
              <TableHead >E-mail</TableHead>
              <TableHead >Telefone</TableHead>
              <TableHead >Função</TableHead>
              <TableHead >Especialidade</TableHead>
              <TableHead className="text-center">
                <div className='flex justify-center w-full'>
                  <Ellipsis />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {Array.from({ length: initialData.limite || 12 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={5}>
                      <Skeleton className='h-9 rounded-sm' />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : initialData.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              initialData.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className='flex gap-2 items-center font-medium'>
                    <Avatar>
                      <Image alt={user.name} src={user.image || "/avatar-placeholder.png"} height={40} width={40} />
                    </Avatar>
                    <span className='mt-1 flex items-center gap-2'>
                      {user.name}
                    </span>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>{user.email}</TableCell>
                  <TableCell className='text-muted-foreground'>{user.telefone || '-'}</TableCell>
                  <TableCell className='text-muted-foreground capitalize'>{user.role || '-'}</TableCell>
                  <TableCell className='text-muted-foreground'>{user.especialidade || '-'}</TableCell>

                  <TableCell className="text-center">
                    <DeleteButton onClick={() => handleExcluir(user.id)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-600 md:text-nowrap max-md:hidden">
          {paginaAtual} - {initialData.totalPaginas} de {initialData.total} resultados
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                className={paginaAtual <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, initialData.totalPaginas) }, (_, i) => {
              const startPage = Math.max(1, Math.min(paginaAtual - 2, initialData.totalPaginas - 4));
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
                className={paginaAtual >= initialData.totalPaginas ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
